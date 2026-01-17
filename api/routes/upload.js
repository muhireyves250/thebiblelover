import express from 'express';
import { uploadSingle, uploadVideo, handleUploadError } from '../middleware/upload.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import cloudinary from '../lib/cloudinary.js';
import streamifier from 'streamifier';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Upload single image
router.post('/image', verifyToken, requireAdmin, uploadSingle, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'bible-project/images',
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
    };

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    const filename = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;

    // Save to database
    await prisma.media.create({
      data: {
        filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        folder: 'images'
      }
    });

    const isBibleVerseImage = req.headers['x-bible-verse-image'] === 'true';
    const imageUrl = isBibleVerseImage
      ? `/api/bible-verses/images/${filename}`
      : `/api/upload/images/${filename}`;

    res.json({
      success: true,
      message: 'Image uploaded to Cloudinary successfully',
      data: {
        filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: imageUrl,
        cloudinaryUrl: cloudinaryResult.secure_url,
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

// Upload single video
router.post('/video', verifyToken, requireAdmin, uploadVideo, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    // Upload to Cloudinary
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'bible-project/videos',
            resource_type: 'video'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
    };

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    const filename = `video-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;

    // Save to database
    await prisma.media.create({
      data: {
        filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        folder: 'videos'
      }
    });

    const videoUrl = `/api/upload/videos/${filename}`;

    res.json({
      success: true,
      message: 'Video uploaded to Cloudinary successfully',
      data: {
        filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: videoUrl,
        cloudinaryUrl: cloudinaryResult.secure_url,
        fullUrl: `${req.protocol}://${req.get('host')}${videoUrl}`
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video'
    });
  }
});

// Migrate existing local files to DB (admin only)
router.post('/migrate', verifyToken, requireAdmin, async (req, res) => {
  try {
    const folders = ['images', 'videos'];
    const results = { migrated: 0, skipped: 0, errors: 0 };

    for (const folder of folders) {
      const folderPath = path.join(process.cwd(), 'uploads', folder);
      if (!fs.existsSync(folderPath)) continue;

      const files = fs.readdirSync(folderPath);
      for (const filename of files) {
        try {
          // Check if already in DB
          const existing = await prisma.media.findUnique({ where: { filename } });
          if (existing) {
            results.skipped++;
            continue;
          }

          const filePath = path.join(folderPath, filename);
          const fileData = fs.readFileSync(filePath);
          const stats = fs.statSync(filePath);

          let mimeType = folder === 'images' ? 'image/png' : 'video/mp4';
          if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) mimeType = 'image/jpeg';
          if (filename.endsWith('.webp')) mimeType = 'image/webp';
          if (filename.endsWith('.webm')) mimeType = 'video/webm';

          await prisma.media.create({
            data: {
              filename,
              originalName: filename,
              mimeType,
              size: stats.size,
              data: fileData,
              folder
            }
          });
          results.migrated++;
        } catch (err) {
          console.error(`Failed to migrate ${filename}:`, err);
          results.errors++;
        }
      }
    }

    res.json({
      success: true,
      message: 'Migration completed',
      data: results
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ success: false, message: 'Migration failed' });
  }
});

// Serve uploaded images
router.get('/images/:filename', async (req, res) => {
  await serveFile(req, res, 'images');
});

// Serve uploaded videos
router.get('/videos/:filename', async (req, res) => {
  await serveFile(req, res, 'videos');
});

// Helper function to serve files from DB with fallback to disk
const serveFile = async (req, res, folder) => {
  const filename = req.params.filename;

  if (!filename || filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ success: false, message: 'Invalid filename' });
  }

  try {
    // 1. Try to find in Database
    const media = await prisma.media.findUnique({
      where: { filename }
    });

    if (media) {
      if (media.url) {
        return res.redirect(media.url);
      }
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Content-Type', media.mimeType);
      res.header('Cache-Control', 'public, max-age=31536000');
      return res.send(media.data);
    }

    // 2. Fallback to local Disk (legacy files)
    const filePath = path.join(process.cwd(), 'uploads', folder, filename);

    if (fs.existsSync(filePath)) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Cache-Control', 'public, max-age=31536000');
      return res.sendFile(filePath);
    }

    res.status(404).json({ success: false, message: 'File not found' });
  } catch (error) {
    console.error('Serve file error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

export default router;
