import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

export default function useApp() {
    const auth = useAuth();

    const [authStatus, setAuthStatus] = useState('');

    function onAuthenticationButtonPressed() {
        setAuthStatus('Loading...');
        auth.signinRedirect();
    }

    useEffect(() => {
        if (auth.isAuthenticated) {
            setAuthStatus('Successfully signed in');
        } else if (auth.error) {
            setAuthStatus('Encountering error: ' + auth.error.message);
        }
    }, [auth]);

    return { authStatus, onAuthenticationButtonPressed };
}
