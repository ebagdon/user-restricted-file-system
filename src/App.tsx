import { STRINGS } from './constants/Strings';

import useApp from './hooks/useApp';

import './css/App.css';

export default function App() {
    const app = useApp();

    return (
        <div className='mainDiv'>
            {app.S3KeysAndURLsRetrieved ? (
                <button className='mainButton' onClick={app.onDownloadButtonPressed}>
                    {STRINGS.downloadButtonText}
                </button>
            ) : (
                <button className='mainButton' disabled={app.authStatus != ''} onClick={app.onAuthButtonPressed}>
                    {STRINGS.authButtonText}
                </button>
            )}
            <p className='statusText'>
                {app.authStatus != '' && !app.S3KeysAndURLsRetrieved ? app.authStatus : app.downloadStatus}
            </p>
        </div>
    );
}
