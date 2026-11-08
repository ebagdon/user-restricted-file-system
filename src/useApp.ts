import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

export default function useApp() {
    const auth = useAuth();

    const [authStatus, setAuthStatus] = useState('');

    const awsCredentialsAPIEndpoint = 'https://boi6iey9wl.execute-api.us-east-1.amazonaws.com/Prod/aws_credentials';
    const [awsCredentialsRetrieved, setAwsCredentialsRetrieved] = useState(false);
    const [accessKeyId, setAccessKeyId] = useState('');
    const [secretKey, setSecretKey] = useState('');

    function onAuthenticationButtonPressed() {
        setAuthStatus('Loading...');
        auth.signinRedirect();
    }

    async function getAWSCredentials() {
        try {
            const response = await fetch(awsCredentialsAPIEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    IdToken: auth.user!.id_token,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.log('ERROR ENCOUNTERED:', response.status, data);
                return null;
            }

            setAwsCredentialsRetrieved(true);
            setAccessKeyId(data['accessKeyId']);
            setSecretKey(data['secretKey']);

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
                setAuthStatus('Signed in. Now connecting...');
                const response = await getAWSCredentials();

                if (response) {
                    setAuthStatus('Connected');
                } else {
                    setAuthStatus('Failed to get AWS credentials');
                }
            } else if (auth.error) {
                setAuthStatus('Encountering error: ' + auth.error.message);
            }
        }

        processAuthentication();
    }, [auth]);

    return { authStatus, awsCredentialsRetrieved, onAuthenticationButtonPressed };
}
