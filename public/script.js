document.addEventListener('DOMContentLoaded', () => {
    const backgroundVideo = document.getElementById('background-video');
    backgroundVideo.playbackRate = 0.25;
    backgroundVideo.play().catch(error => {
        console.error('Error playing background video:', error);
    });

    // Single fetch call with relative URL
    fetch('/videos')
        .then(response => response.json())
        .then(videos => {
            console.log('Received videos:', videos);
            const videoList = document.getElementById('video-list');
            const mainVideo = document.getElementById('main-video');
            
            videos.forEach(videoUrl => {
                const listItem = document.createElement('li');
                const videoLink = document.createElement('a');
                videoLink.href = '#';
                videoLink.textContent = videoUrl.split('/').pop().replace('.mp4', '').replace('.MOV', '');
                videoLink.setAttribute('data-video', videoUrl);
                
                videoLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    mainVideo.innerHTML = '';
                    const sourceElement = document.createElement('source');
                    sourceElement.src = videoUrl;
                    sourceElement.type = videoUrl.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'video/quicktime';
                    mainVideo.appendChild(sourceElement);
                    mainVideo.load();
                    mainVideo.play().catch(error => {
                        console.error('Error playing video:', error);
                    });
                });
                
                listItem.appendChild(videoLink);
                videoList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching videos:', error));
});