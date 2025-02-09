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

// Function to validate video format
function isValidVideoFormat(resource) {
    // Check if the resource has a valid video format
    const validFormats = ['mp4', 'mov', 'MOV', 'MP4'];
    const format = resource.format ? resource.format.toLowerCase() : '';
    return validFormats.includes(format.toLowerCase());
}

// API endpoint to get list of videos from Cloudinary
app.get('/videos', async (req, res) => {
    try {
        console.log('Fetching videos from Cloudinary...');
        
        const result = await cloudinary.api.resources({
            type: 'upload',
            resource_type: 'video',
            max_results: 500,
            prefix: ''
        });
        
        console.log(`Found ${result.resources.length} total resources`);
        
        // Filter out duplicates and invalid videos using a Map
        const uniqueVideos = new Map();
        
        result.resources.forEach(resource => {
            // Only process if it's a valid video format
            if (isValidVideoFormat(resource)) {
                const url = cloudinary.url(resource.public_id, {
                    resource_type: 'video',
                    secure: true
                });
                
                const name = resource.public_id.split('/').pop();
                
                // Use public_id as unique identifier
                if (!uniqueVideos.has(resource.public_id)) {
                    uniqueVideos.set(resource.public_id, {
                        url,
                        name,
                        format: resource.format
                    });
                    
                    console.log('Added valid video:', {
                        name,
                        format: resource.format,
                        public_id: resource.public_id
                    });
                }
            } else {
                console.log('Skipped invalid resource:', {
                    public_id: resource.public_id,
                    format: resource.format
                });
            }
        });
        
        const videoFiles = Array.from(uniqueVideos.values());
        console.log(`Sending ${videoFiles.length} unique valid videos`);
        
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
    console.log('Cloudinary configuration verified');
});