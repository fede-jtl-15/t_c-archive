const express = require('express');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());

// Define path for static files
const PUBLIC_FOLDER = path.join(__dirname, 'public');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware to serve static files
app.use(express.static(PUBLIC_FOLDER));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_FOLDER, 'index.html'));
});

// API endpoint to get list of videos from Cloudinary
app.get('/videos', async (req, res) => {
    try {
        console.log('Fetching videos from Cloudinary...');
        
        const result = await cloudinary.api.resources({
            type: 'upload',
            resource_type: 'video',
            max_results: 500,
            prefix: 'videos/', // Match your folder structure
            context: true,
            metadata: true
        });
        
        if (!result.resources || result.resources.length === 0) {
            console.log('No videos found in Cloudinary');
            return res.json([]);
        }

        // Create video list with optimized settings
        const videoFiles = result.resources
            .filter(resource => resource.format && resource.format.toLowerCase() === 'mp4')
            .map(resource => ({
                url: cloudinary.url(resource.public_id, {
                    resource_type: 'video',
                    secure: true,
                    quality: 'auto',
                    fetch_format: 'auto'
                }),
                name: resource.public_id.split('/').pop().replace(/\.[^/.]+$/, '')
            }));
        
        console.log(`Sending ${videoFiles.length} optimized video URLs`);
        res.json(videoFiles);
        
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({
            error: 'Failed to fetch videos',
            details: error.message
        });
    }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});