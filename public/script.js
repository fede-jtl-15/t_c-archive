document.addEventListener('DOMContentLoaded', () => {
    const backgroundVideo = document.getElementById('background-video');
    const videoList = document.getElementById('video-list');
    const mainVideo = document.getElementById('main-video');

    // Set background video properties
    if (backgroundVideo) {
        backgroundVideo.playbackRate = 0.25;
        backgroundVideo.play().catch(error => {
            console.error('Error playing background video:', error);
        });
    }

    // Enable looping for main video
    if (mainVideo) {
        mainVideo.loop = true;
    }

    // Fetch videos from server
    fetch('/videos')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(videos => {
            console.log(`Received ${videos.length} videos from server`);
            
            // Clear existing list
            videoList.innerHTML = '';
            
            if (videos.length === 0) {
                videoList.innerHTML = '<li>No videos available</li>';
                return;
            }
            
            // Add each video to the list
            videos.forEach(video => {
                if (video.url && video.name) {
                    const listItem = document.createElement('li');
                    const videoLink = document.createElement('a');
                    
                    videoLink.href = '#';
                    videoLink.textContent = video.name;
                    videoLink.setAttribute('data-video', video.url);
                    
                    videoLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        
                        // Update main video source
                        mainVideo.innerHTML = '';
                        const sourceElement = document.createElement('source');
                        sourceElement.src = video.url;
                        sourceElement.type = 'video/mp4';
                        mainVideo.appendChild(sourceElement);
                        
                        // Load and play the video
                        mainVideo.load();
                        mainVideo.play().catch(error => {
                            console.error('Error playing video:', error);
                        });
                    });
                    
                    listItem.appendChild(videoLink);
                    videoList.appendChild(listItem);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
            videoList.innerHTML = '<li>Error loading videos</li>';
        });
});