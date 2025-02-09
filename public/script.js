document.addEventListener('DOMContentLoaded', () => {
    const backgroundVideo = document.getElementById('background-video');
    const videoList = document.getElementById('video-list');
    const mainVideo = document.getElementById('main-video');

    // Set background video properties
    backgroundVideo.playbackRate = 0.25;
    backgroundVideo.play().catch(error => {
        console.error('Error playing background video:', error);
    });

    // Enable looping for main video
    mainVideo.loop = true;

    // Fetch videos from server
    fetch('/videos')
        .then(response => response.json())
        .then(videos => {
            console.log('Received videos:', videos);
            
            // Clear existing list
            videoList.innerHTML = '';
            
            // Add each video to the list
            videos.forEach(video => {
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
            });
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
            videoList.innerHTML = '<li>Error loading videos</li>';
        });
});