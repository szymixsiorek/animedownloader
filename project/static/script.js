// static/script.js
document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('popup');
    const closePopupButton = document.getElementById('close-popup');
    closePopupButton.addEventListener('click', function() {
        popup.style.display = 'none';
    });
});

document.getElementById('download-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const fileUrl = document.getElementById('file-url').value;
    downloadFile(fileUrl);
});

async function downloadFile(url) {
    const progressContainer = document.getElementById('progress-container');
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');
    const speedText = document.getElementById('speed-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    progressContainer.style.display = 'block';
    loadingSpinner.style.display = 'block';

    const response = await fetch(`/download?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
        alert('Failed to download file');
        loadingSpinner.style.display = 'none';
        return;
    }

    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');
    let receivedLength = 0;
    let chunks = [];
    let startTime = Date.now();

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        chunks.push(value);
        receivedLength += value.length;

        // Update progress
        const progress = (receivedLength / contentLength) * 100;
        progressText.textContent = `Progress: ${Math.round(progress)}%`;
        progressBar.style.width = `${progress}%`;

        // Calculate speed
        const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
        const speed = receivedLength / elapsedTime; // bytes per second
        const speedInMB = (speed / (1024 * 1024)).toFixed(2); // MB/s
        speedText.textContent = `Speed: ${speedInMB} MB/s`;
    }

    const blob = new Blob(chunks);
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = url.split('/').pop();
    document.body.appendChild(a);
    a.click();
    a.remove();
    progressContainer.style.display = 'none';
    loadingSpinner.style.display = 'none';
}
