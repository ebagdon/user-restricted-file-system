import useApp from './useApp';

import './App.css';

export default function App() {
    const app = useApp();

    return (
        <div className='mainDiv'>
            {app.S3KeysURLsRetrieved ? (
                <button className='mainButton' onClick={app.onDownloadButtonPressed}>
                    Download
                </button>
            ) : (
                <button
                    className='mainButton'
                    disabled={app.authStatus != ''}
                    onClick={app.onAuthenticationButtonPressed}>
                    Authenticate
                </button>
            )}
            <p className='authenticationStatusText'>
                {app.authStatus != '' && !app.S3KeysURLsRetrieved && app.authStatus}
            </p>
        </div>
    );
}
