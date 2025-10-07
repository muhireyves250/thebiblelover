import express from 'express';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Upload single image
router.post('/image', verifyToken, requireAdmin, uploadSingle, handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Generate the public URL for the uploaded image using API route
    // For bible verse images, use the dedicated bible verse endpoint
    const isBibleVerseImage = req.headers['x-bible-verse-image'] === 'true';
    const imageUrl = isBibleVerseImage 
      ? `/api/bible-verses/images/${req.file.filename}`
      : `/api/upload/images/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: imageUrl,
        fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
});

// Serve uploaded images with proper CORS headers
router.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // Validate filename to prevent directory traversal
  if (!filename || filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid filename'
    });
  }
  
  const imagePath = path.join(process.cwd(), 'uploads', 'images', filename);
  
  // Set comprehensive CORS headers for this specific route
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Check if file exists first
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }
  
  // Send the file
  res.sendFile(imagePath, (err) => {
    if (err && !res.headersSent) {
      console.error('Error serving image:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to serve image'
      });
    }
  });
});

export default router;
