import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from 'react-oidc-context';

import App from './App.tsx';

import './main.css';

const cognitoAuthConfig = {
    authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_j9TBZsBzV',
    client_id: '6ggm1g2vahp2bnrac0r59m0bdr',
    redirect_uri: 'http://localhost:5173/',
    response_type: 'code',
    scope: 'aws.cognito.signin.user.admin email openid',
};

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider {...cognitoAuthConfig}>
            <App />
        </AuthProvider>
    </StrictMode>,
);
