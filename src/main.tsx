import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from 'react-oidc-context';

import App from './App.tsx';

import './main.css';

const cognitoAuthConfig = {
    authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_j9TBZsBzV',
    client_id: '6ggm1g2vahp2bnrac0r59m0bdr',
    redirect_uri: 'https://d2q4agxruk0y1p.cloudfront.net',
    response_type: 'code',
    scope: 'email openid',
};

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider {...cognitoAuthConfig}>
            <App />
        </AuthProvider>
    </StrictMode>,
);
