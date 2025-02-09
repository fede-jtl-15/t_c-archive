const express = require('express');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());

// Define paths
const VIDEOS_FOLDER = path.join(__dirname, 'videos');
const PUBLIC_FOLDER = path.join(__dirname, 'public');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Ensure videos folder exists
if (!fs.existsSync(VIDEOS_FOLDER)) {
    fs.mkdirSync(VIDEOS_FOLDER);
}

// Function to upload new videos to Cloudinary
async function uploadNewVideos() {
    try {
        const files = fs.readdirSync(VIDEOS_FOLDER);

        if (files.length === 0) {
            console.log('No new videos to upload');
            return;
        }

        for (const file of files) {
            if (file.endsWith('.mp4') || file.endsWith('.MOV')) {
                const filePath = path.join(VIDEOS_FOLDER, file);
                
                try {
                    // Upload to Cloudinary
                    const result = await cloudinary.uploader.upload(filePath, {
                        resource_type: 'video',
                        folder: 'videos',
                        public_id: file.replace(/\.[^/.]+$/, '') // Remove file extension for public_id
                    });
                    
                    console.log(`Successfully uploaded: ${file}`);
                    console.log('Cloudinary response:', result);
                    
                    // Remove local file after successful upload
                    fs.unlinkSync(filePath);
                } catch (uploadError) {
                    console.error(`Error uploading ${file}:`, uploadError);
                }
            }
        }
    } catch (error) {
        console.error('Error in uploadNewVideos:', error);
    }
}

// Middleware to serve static files
app.use(express.static(PUBLIC_FOLDER));
app.use('/videos', express.static(VIDEOS_FOLDER));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_FOLDER, 'index.html'));
});

// API endpoint to get list of videos
app.get('/videos', async (req, res) => {
    try {
        console.log('Fetching videos from Cloudinary...');
        
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'videos/',
            resource_type: 'video',
            max_results: 500
        });
        
        console.log('Cloudinary API Response:', result);
        
        if (!result.resources || result.resources.length === 0) {
            console.log('No videos found in Cloudinary');
            return res.json([]);
        }
        
        const videoFiles = result.resources.map(resource => {
            const url = cloudinary.url(resource.public_id, {
                resource_type: 'video',
                secure: true
            });
            console.log('Generated URL:', url);
            return url;
        });
        
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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    
    // Upload any new videos when server starts
    uploadNewVideos().catch(error => {
        console.error('Error during initial video upload:', error);
    });
});