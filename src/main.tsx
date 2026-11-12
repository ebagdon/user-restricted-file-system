import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from 'react-oidc-context';

import App from './App.tsx';

import { CONFIG } from './constants/Config.ts';

import './css/Main.css';

const cognitoAuthConfig = {
    authority: 'https://cognito-idp.us-east-1.amazonaws.com/' + CONFIG.cognitoUserPoolID,
    client_id: CONFIG.cognitoAppClientID,
    redirect_uri: CONFIG.websiteURL,
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
