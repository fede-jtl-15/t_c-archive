const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const VIDEOS_FOLDER = path.join(__dirname, 'videos'); // Path to your videos folder
const PUBLIC_FOLDER = path.join(__dirname, 'public'); // Path to your public folder

// Serve static files (HTML, CSS, JS)
app.use(express.static(PUBLIC_FOLDER));

// Serve video files from the videos folder
app.use('/videos', express.static(VIDEOS_FOLDER));

// Serve the index.html file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_FOLDER, 'index.html'));
});

// Endpoint to get the list of videos
app.get('/videos', (req, res) => {
    fs.readdir(VIDEOS_FOLDER, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan videos directory');
        }
        // Include both .mp4 and .mov files
        const videoFiles = files.filter(file => file.endsWith('.MOV') || file.endsWith('.mp4'));
        res.json(videoFiles);
    });
});

// Start the server (only one listen call)
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});