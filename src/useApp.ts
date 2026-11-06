import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

export default function useApp() {
    const auth = useAuth();

    const [authStatus, setAuthStatus] = useState('');
    const awsCredentialsAPIEndpoint = 'https://boi6iey9wl.execute-api.us-east-1.amazonaws.com/Prod/aws_credentials';

    function onAuthenticationButtonPressed() {
        setAuthStatus('Loading...');
        auth.signinRedirect();
    }

    async function getAWSCredentials() {
        try {
            if (auth.user?.id_token) {
                const response = await fetch(awsCredentialsAPIEndpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ IdentityId: auth.user.id_token }),
                });

                const data = await response.json();

                if (!response.ok) {
                    console.log('ERROR ENCOUNTERED:', response.status, data);
                }

                console.log('SUCCESS:', data);
            } else {
                console.log('ERROR ENCOUNTERED: User did not have id_token.');
            }
        } catch (error) {
            console.log('ERROR ENCOUNTERED:', error);
        }
    }

    useEffect(() => {
        if (auth.isAuthenticated) {
            setAuthStatus('Successfully signed in');
            getAWSCredentials();
        } else if (auth.error) {
            setAuthStatus('Encountering error: ' + auth.error.message);
        }
    }, [auth]);

    return { authStatus, onAuthenticationButtonPressed };
}
