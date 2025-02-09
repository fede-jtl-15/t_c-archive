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
            prefix: 'videos/', // This should match your Cloudinary folder name
            resource_type: 'video',
            max_results: 500
        });
        
        console.log('Cloudinary API Response:', result);
        
        if (!result.resources || result.resources.length === 0) {
            console.log('No videos found in Cloudinary');
            return res.json([]);
        }
        
        const videoFiles = result.resources.map(resource => ({
            url: cloudinary.url(resource.public_id, {
                resource_type: 'video',
                secure: true
            }),
            name: resource.public_id.split('/').pop() // Get the filename without the path
        }));
        
        console.log('Sending video URLs:', videoFiles);
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
    console.log(`Server running on port ${port}`);
});