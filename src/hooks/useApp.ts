import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

import { CONFIG } from '../constants/Config';
import { STRINGS } from '../constants/Strings';

import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export default function useApp() {
    const auth = useAuth();

    const [authStatus, setAuthStatus] = useState('');

    const [S3KeysAndURLsRetrieved, setS3KeysAndURLsRetrieved] = useState(false);
    const [S3KeysAndURLs, setS3KeysAndURLs] = useState([]);

    const [downloadStatus, setDownloadStatus] = useState('');

    function onAuthButtonPressed() {
        setAuthStatus(STRINGS.authLoadingStatus);
        auth.signinRedirect();
    }

    async function onDownloadButtonPressed() {
        setDownloadStatus(STRINGS.downloadingFilesStatus);

        let S3KeysAndData = [];
        for (let i = 0; i < S3KeysAndURLs.length; i++) {
            const response = await fetch(S3KeysAndURLs[i][1], {
                method: 'GET',
            });
            const newKeyAndData: [string, Blob] = [S3KeysAndURLs[i][0], await response.blob()];
            S3KeysAndData.push(newKeyAndData);
        }

        let zip = new JSZip();
        for (let i = 0; i < S3KeysAndData.length; i++) {
            const key = S3KeysAndData[i][0];
            const data = S3KeysAndData[i][1];
            zip.file(key, data);
        }

        try {
            await zip.generateAsync({ type: 'blob' }).then(function (blob) {
                saveAs(blob, 'data.zip');
            });
            setDownloadStatus(STRINGS.downloadSuccessStatus);
        } catch {
            setDownloadStatus(STRINGS.downloadFailedStatus);
        }
    }

    async function getS3URLs() {
        try {
            const response = await fetch(CONFIG.S3KeysAndURLsAPIEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    AccessToken: auth.user!.access_token,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return null;
            }

            setS3KeysAndURLsRetrieved(true);
            setS3KeysAndURLs(data['S3KeysURLs']);

            return data;
        } catch (error) {
            return null;
        }
    }

    useEffect(() => {
        async function processAuthentication() {
            if (auth.isAuthenticated) {
                setAuthStatus(STRINGS.authSuccessStatus);
                const response = await getS3URLs();

                if (response) {
                    setAuthStatus(STRINGS.authConnectedStatus);
                } else {
                    setAuthStatus(STRINGS.authFailedToGetS3URLsStatus);
                }
            } else if (auth.error) {
                setAuthStatus(STRINGS.authFailedStatus);
            }
        }

        processAuthentication();
    }, [auth]);

    return {
        authStatus,
        downloadStatus,
        onAuthButtonPressed,
        onDownloadButtonPressed,
        S3KeysAndURLsRetrieved,
    };
}
