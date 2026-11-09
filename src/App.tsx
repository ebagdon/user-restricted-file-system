import useApp from './useApp';

import './App.css';

export default function App() {
    const app = useApp();

    return (
        <div className='mainDiv'>
            {app.S3URLsRetrieved ? (
                <button className='mainButton' onClick={app.onDownloadButtonPressed}>
                    Download
                </button>
            ) : (
                <button className='mainButton' onClick={app.onAuthenticationButtonPressed}>
                    Authenticate
                </button>
            )}
            <p className='mainButtonText'>{app.authStatus != '' && !app.S3URLsRetrieved && app.authStatus}</p>
        </div>
    );
}
