import useApp from './useApp';

import './App.css';

export default function App() {
    const app = useApp();

    return (
        <div className='mainDiv'>
            <button className='authenticateButton' onClick={app.onAuthenticationButtonPressed}>
                Authenticate
            </button>
            <p className='authStatusText'>{app.authStatus != '' && app.authStatus}</p>
        </div>
    );
}
