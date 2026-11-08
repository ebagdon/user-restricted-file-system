import useApp from './useApp';

import './App.css';

export default function App() {
    const app = useApp();

    return (
        <div className='mainDiv'>
            {app.awsCredentialsRetrieved ? (
                <button className='mainButton'>Download</button>
            ) : (
                <button className='mainButton' onClick={app.onAuthenticationButtonPressed}>
                    Authenticate
                </button>
            )}
            <p className='mainButtonText'>{app.authStatus != '' && !app.awsCredentialsRetrieved && app.authStatus}</p>
        </div>
    );
}
