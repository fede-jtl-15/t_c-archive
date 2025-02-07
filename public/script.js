// Fetch the list of videos from the server
fetch('http://localhost:3000/videos')
    .then(response => response.json())
    .then(videoFiles => {
        const videoList = document.getElementById('video-list');
        const mainVideo = document.getElementById('main-video');

        // Wait for the DOM to load
        document.addEventListener('DOMContentLoaded', () => {
            // Get the background video element
            const backgroundVideo = document.getElementById('background-video');

            // Set the playback speed (e.g., 0.5 for half speed)
            backgroundVideo.playbackRate = 0.25;

            // Ensure the video plays (autoplay may not work in some browsers without user interaction)
            backgroundVideo.play().catch(error => {
                console.error('Error playing background video:', error);
            });
        });
        
        // Enable looping
        mainVideo.loop = true;

        // Generate video links dynamically
        videoFiles.forEach(file => {
            const listItem = document.createElement('li');
            const videoLink = document.createElement('a');
            videoLink.href = '#';
            videoLink.textContent = file.replace('.mp4', '').replace('.MOV', ''); // Remove file extension
            videoLink.setAttribute('data-video', `videos/${file}`); // Set the video path
            listItem.appendChild(videoLink);
            videoList.appendChild(listItem);
        });

        // Add click event listeners to each video link
        const videoLinks = document.querySelectorAll('.video-list a');
        videoLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                const videoSrc = link.getAttribute('data-video'); // Get the video source
                const videoType = videoSrc.endsWith('.mp4') ? 'video/mp4' : 'video/quicktime'; // Set MIME type
                const videoType2 = videoSrc.endsWith('.MOV') ? 'video/MOV' : 'video/quicktime'; // Set MIME type

                // Update the video source
                mainVideo.innerHTML = ''; // Clear existing sources
                const sourceElement = document.createElement('source');
                sourceElement.src = videoSrc;
                sourceElement.type = videoType;
                sourceElement.type = videoType2;
                mainVideo.appendChild(sourceElement);

                // Load and play the video
                mainVideo.load();
                mainVideo.play().catch(error => {
                    console.error('Error playing video:', error);
                });
            });
        });
    })
    .catch(error => console.error('Error fetching videos:', error));