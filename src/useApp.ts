import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export default function useApp() {
    const auth = useAuth();

    const [authStatus, setAuthStatus] = useState('');

    const S3URLsAPIEndpoint = 'https://s3c6yjjrgi.execute-api.us-east-1.amazonaws.com/Prod/get_s3_urls';
    const [S3KeysURLsRetrieved, setS3KeysURLsRetrieved] = useState(false);
    const [S3KeysURLs, setS3KeysURLs] = useState([]);

    const [downloadStatus, setDownloadStatus] = useState('');

    function onAuthenticationButtonPressed() {
        setAuthStatus('Loading...');
        auth.signinRedirect();
    }

    async function onDownloadButtonPressed() {
        setDownloadStatus('Downloading files...');

        let S3KeysData = [];
        for (let i = 0; i < S3KeysURLs.length; i++) {
            const response = await fetch(S3KeysURLs[i][1], {
                method: 'GET',
            });
            const newKeyData: [string, Blob] = [S3KeysURLs[i][0], await response.blob()];
            S3KeysData.push(newKeyData);
        }

        let zip = new JSZip();
        for (let i = 0; i < S3KeysData.length; i++) {
            const currentKey = S3KeysData[i][0];
            const data = S3KeysData[i][1];
            zip.file(currentKey, data);
        }

        try {
            await zip.generateAsync({ type: 'blob' }).then(function (blob) {
                saveAs(blob, 'data.zip');
            });
            setDownloadStatus('Download success');
        } catch {
            setDownloadStatus('Download failed');
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

    return {
        authStatus,
        downloadStatus,
        onAuthenticationButtonPressed,
        onDownloadButtonPressed,
        S3KeysURLs,
        S3KeysURLsRetrieved,
    };
}
