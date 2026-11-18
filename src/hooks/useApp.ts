import { useEffect, useRef, useState } from 'react';
import { useAuth } from 'react-oidc-context';

import { CONFIG } from '../constants/Config';
import { STRINGS } from '../constants/Strings';

import { downloadZip } from 'client-zip';

export default function useApp() {
    const auth = useAuth();

    const [authStatus, setAuthStatus] = useState('');

    const [S3ObjectDataRetrieved, setS3ObjectDataRetrieved] = useState(false);
    const [S3ObjectData, setS3ObjectData] = useState([]);

    const [downloadStatus, setDownloadStatus] = useState('');
    const [downloadProgress, setDownloadProgress] = useState(0);

    let downloadedBytes = useRef(0);
    let lastPercent = useRef(0);

    function onAuthButtonPressed() {
        setAuthStatus(STRINGS.authLoadingStatus);
        auth.signinRedirect();
    }

    function onBytesDownloaded(n: number) {
        const totalBytes = S3ObjectData.reduce((sum, item) => sum + item[2], 0);

        downloadedBytes.current += n;
        const percent = Math.min(100, Math.floor((downloadedBytes.current / totalBytes) * 100));
        if (percent !== lastPercent.current) {
            lastPercent.current = percent;
            setDownloadProgress(percent);
        }
    }

    async function* getZipEntries() {
        for (let i = 0; i < S3ObjectData.length; i++) {
            const response = await fetch(S3ObjectData[i][1], {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`Failed to download ${S3ObjectData[i][1]}: ${response.status}`);
            }

            const counter = new TransformStream({
                transform(chunk, controller) {
                    onBytesDownloaded(chunk.byteLength);
                    controller.enqueue(chunk);
                },
            });

            yield { name: S3ObjectData[i][0], input: new Response(response.body!.pipeThrough(counter)) };
        }
    }

    async function onDownloadButtonPressed() {
        setDownloadStatus(STRINGS.downloadingFilesStatus);
        setDownloadProgress(0);

        try {
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: 'data.zip',
            });
            const writable = await handle.createWritable();

            await downloadZip(getZipEntries()).body!.pipeTo(writable);

            setDownloadStatus(STRINGS.downloadSuccessStatus);
            setDownloadProgress(100);
        } catch {
            setDownloadStatus(STRINGS.downloadFailedStatus);
        }
    }

    async function getS3KeysAndURLs() {
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

            setS3ObjectDataRetrieved(true);
            setS3ObjectData(data['S3ObjectData']);

            return data;
        } catch {
            return null;
        }
    }

    useEffect(() => {
        async function processAuthentication() {
            if (auth.isAuthenticated) {
                setAuthStatus(STRINGS.authSuccessStatus);
                const response = await getS3KeysAndURLs();

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
        downloadProgress,
        downloadStatus,
        onAuthButtonPressed,
        onDownloadButtonPressed,
        S3ObjectDataRetrieved,
    };
}
