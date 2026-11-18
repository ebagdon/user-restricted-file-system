import { STRINGS } from './constants/Strings';

import useApp from './hooks/useApp';

import './css/App.css';

export default function App() {
    const app = useApp();

    return (
        <div className='mainDiv'>
            {app.S3ObjectDataRetrieved ? (
                <button
                    className='mainButton'
                    disabled={app.downloadStatus != '' && app.downloadStatus != STRINGS.downloadSuccessStatus}
                    onClick={app.onDownloadButtonPressed}>
                    {STRINGS.downloadButtonText}
                </button>
            ) : (
                <button className='mainButton' disabled={app.authStatus != ''} onClick={app.onAuthButtonPressed}>
                    {STRINGS.authButtonText}
                </button>
            )}
            <p className='statusText'>
                {app.authStatus != '' && !app.S3ObjectDataRetrieved ? app.authStatus : app.downloadStatus}
            </p>
            {app.downloadStatus != '' && (
                <div className='downloadProgressBarContainer'>
                    <div className='downloadProgressBarBackground'>
                        <div className='downloadProgressBarFill' style={{ width: `${app.downloadProgress}%` }} />
                    </div>
                    <span className='downloadProgressBarText'>{app.downloadProgress}%</span>
                </div>
            )}
        </div>
    );
}
