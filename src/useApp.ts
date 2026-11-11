import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

export default function useApp() {
    const auth = useAuth();

    const [authStatus, setAuthStatus] = useState('');

    const S3URLsAPIEndpoint = 'https://s3c6yjjrgi.execute-api.us-east-1.amazonaws.com/Prod/get_s3_urls';
    const [S3KeysURLsRetrieved, setS3KeysURLsRetrieved] = useState(false);
    const [S3KeysURLs, setS3KeysURLs] = useState([]);

    function onAuthenticationButtonPressed() {
        setAuthStatus('Loading...');
        auth.signinRedirect();
    }

    async function onDownloadButtonPressed() {
        let S3KeysData = [];
        for (let i = 0; i < S3KeysURLs.length; i++) {
            const response = await fetch(S3KeysURLs[i][1], {
                method: 'GET',
            });
            S3KeysData.push([S3KeysURLs[i][0], await response.blob()]);
        }
    }

    async function getS3URLs() {
        try {
            const response = await fetch(S3URLsAPIEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    AccessToken: auth.user!.access_token,
                    IdToken: auth.user!.id_token,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.log('ERROR ENCOUNTERED:', response.status, data);
                return null;
            }

            setS3KeysURLsRetrieved(true);
            setS3KeysURLs(data['S3KeysURLs']);

            console.log('SUCCESS:', data);
            return data;
        } catch (error) {
            console.log('CAUGHT ERROR:', error);
            return null;
        }
    }

    useEffect(() => {
        async function processAuthentication() {
            if (auth.isAuthenticated) {
                setAuthStatus('Signed in. Now retrieving download URLs...');
                const response = await getS3URLs();

                if (response) {
                    setAuthStatus('Connected');
                } else {
                    setAuthStatus('Failed to get S3 URLs');
                }
            } else if (auth.error) {
                setAuthStatus('Encountering error: ' + auth.error.message);
            }
        }

        processAuthentication();
    }, [auth]);

    return { authStatus, onAuthenticationButtonPressed, onDownloadButtonPressed, S3KeysURLs, S3KeysURLsRetrieved };
}
