const express = require('express');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const app = express();
const VIDEOS_FOLDER = path.join(__dirname, 'videos'); // Path to your videos folder
const PUBLIC_FOLDER = path.join(__dirname, 'public'); // Path to your public folder


// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

if (!fs.existsSync(VIDEOS_FOLDER)) {
    fs.mkdirSync(VIDEOS_FOLDER);
  }

//upload folder from folder
async function uploadNewVideos() {
    try {
      const files = fs.readdirSync(VIDEOS_FOLDER);

      if (files.length === 0) {
        console.log('No videos to upload');
        return;
      }    

      for (const file of files) {
        if (file.endsWith('.mp4') || file.endsWith('.MOV')) {
          const filePath = path.join(VIDEOS_FOLDER, file);
          
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'video',
            folder: 'videos/'
          });
          
          console.log(`Uploaded: ${file}`);
          
          // Optional: Remove local file after upload
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  }
  
  // Run upload on server start
  uploadNewVideos();
  

// Serve static files (HTML, CSS, JS)
app.use(express.static(PUBLIC_FOLDER));

// Serve video files from the videos folder
app.use('/videos', express.static(VIDEOS_FOLDER));

// Serve the index.html file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_FOLDER, 'index.html'));
});

// Endpoint to get the list of videos
app.get('/videos', async (req, res) => {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'videos/', // Your video folder in Cloudinary
        max_results: 500
      });
      
      const videoFiles = result.resources.map(resource => resource.public_id);
      res.json(videoFiles);
    } catch (error) {
      res.status(500).send('Unable to fetch videos');
    }
  });

// Start the server (only one listen call)
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});