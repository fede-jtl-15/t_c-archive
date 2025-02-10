document.addEventListener('DOMContentLoaded', () => {
    const backgroundVideo = document.getElementById('background-video');
    const videoList = document.getElementById('video-list');
    const mainVideo = document.getElementById('main-video');

    // Set background video properties
    if (backgroundVideo) {
        backgroundVideo.playbackRate = 1; // Updated playback rate
        backgroundVideo.play().catch(error => {
            console.error('Error playing background video:', error);
        });
    }

    // Configure main video
    if (mainVideo) {
        mainVideo.loop = true;
        mainVideo.preload = 'auto'; // Enable preloading
        
        // Add loading indicator
        mainVideo.addEventListener('loadstart', () => {
            mainVideo.style.opacity = '0.3';
        });
        
        mainVideo.addEventListener('canplay', () => {
            mainVideo.style.opacity = '1';
        });
    }

    // Keep track of current video URL
    let currentVideoUrl = null;

    // Preload videos function
    function preloadVideo(url) {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'video';
        preloadLink.href = url;
        document.head.appendChild(preloadLink);
    }

    // Fetch and display videos
    fetch('/videos')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(videos => {
            console.log(`Received ${videos.length} videos`);
            videoList.innerHTML = '';
            
            if (videos.length === 0) {
                videoList.innerHTML = '<li>No videos available</li>';
                return;
            }

            // Create video links with preloading
            videos.forEach((video, index) => {
                const listItem = document.createElement('li');
                const videoLink = document.createElement('a');
                
                videoLink.href = '#';
                videoLink.textContent = video.name;
                videoLink.setAttribute('data-video', video.url);

                // Preload the first video
                if (index === 0) {
                    preloadVideo(video.url);
                }
                
                videoLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Don't reload if it's the same video
                    if (currentVideoUrl === video.url) return;
                    
                    currentVideoUrl = video.url;
                    
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

                    // Preload the next video if it exists
                    const nextIndex = (index + 1) % videos.length;
                    preloadVideo(videos[nextIndex].url);
                });
                
                listItem.appendChild(videoLink);
                videoList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            videoList.innerHTML = '<li>Error loading videos</li>';
        });
});