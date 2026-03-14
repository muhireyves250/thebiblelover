import express from 'express';
import { uploadSingle, uploadVideo, handleUploadError } from '../middleware/upload.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import cloudinary from '../lib/cloudinary.js';
import streamifier from 'streamifier';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper to check if Cloudinary is properly configured
const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_URL || 
         (process.env.CLOUDINARY_CLOUD_NAME && 
          process.env.CLOUDINARY_API_KEY && 
          process.env.CLOUDINARY_API_SECRET);
};

// Helper to save buffer to local disk
const saveBufferToDisk = async (buffer, filename, folder) => {
  const uploadsDir = path.join(__dirname, '../../uploads', folder);
  console.log(`[Upload] Saving to disk: ${uploadsDir}/${filename}`);
  if (!fs.existsSync(uploadsDir)) {
    console.log(`[Upload] Creating directory: ${uploadsDir}`);
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);
  return filePath;
};

// Helper to get consistent full URL
const getFullUrl = (req, relativeUrl) => {
  const baseUrl = process.env.APP_URL || process.env.API_URL;
  if (baseUrl) {
    const sanitizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${sanitizedBaseUrl}${relativeUrl}`;
  }
  return `${req.protocol}://${req.get('host')}${relativeUrl}`;
};

// Upload single image
router.post('/image', verifyToken, requireAdmin, uploadSingle, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const filename = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
    let imageUrl;
    let cloudinaryResult = null;

    if (isCloudinaryConfigured()) {
      try {
        const uploadToCloudinary = (buffer) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'bible-project/images', resource_type: 'auto' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            streamifier.createReadStream(buffer).pipe(uploadStream);
          });
        };
        cloudinaryResult = await uploadToCloudinary(req.file.buffer);
        imageUrl = cloudinaryResult.secure_url;
      } catch (cloudinaryError) {
        console.warn('Cloudinary upload failed, falling back to local storage:', cloudinaryError);
      }
    }

    if (!imageUrl) {
      await saveBufferToDisk(req.file.buffer, filename, 'images');
      const isBibleVerseImage = req.headers['x-bible-verse-image'] === 'true';
      imageUrl = isBibleVerseImage
        ? `/api/bible-verses/images/${filename}`
        : `/api/upload/images/${filename}`;
    }

    // Save to database
    await prisma.media.create({
      data: {
        filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: cloudinaryResult?.secure_url || null,
        publicId: cloudinaryResult?.public_id || null,
        folder: 'images',
        // Optional: Store binary data if needed, but here we favor file serving
      }
    });

    const fullUrl = getFullUrl(req, imageUrl.startsWith('http') ? imageUrl : imageUrl);

    res.json({
      success: true,
      message: cloudinaryResult ? 'Image uploaded to Cloudinary successfully' : 'Image uploaded to local storage successfully',
      data: {
        filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: imageUrl,
        fullUrl: fullUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

// Upload single video
router.post('/video', verifyToken, requireAdmin, uploadVideo, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file provided' });
    }

    const filename = `video-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
    let videoUrl;
    let cloudinaryResult = null;

    if (isCloudinaryConfigured()) {
      try {
        const uploadToCloudinary = (buffer) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'bible-project/videos', resource_type: 'video' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            streamifier.createReadStream(buffer).pipe(uploadStream);
          });
        };
        cloudinaryResult = await uploadToCloudinary(req.file.buffer);
        videoUrl = cloudinaryResult.secure_url;
      } catch (cloudinaryError) {
        console.warn('Cloudinary upload failed, falling back to local storage:', cloudinaryError);
      }
    }

    if (!videoUrl) {
      await saveBufferToDisk(req.file.buffer, filename, 'videos');
      videoUrl = `/api/upload/videos/${filename}`;
    }

    // Save to database
    await prisma.media.create({
      data: {
        filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: cloudinaryResult?.secure_url || null,
        publicId: cloudinaryResult?.public_id || null,
        folder: 'videos'
      }
    });

    const fullUrl = getFullUrl(req, videoUrl.startsWith('http') ? videoUrl : videoUrl);

    res.json({
      success: true,
      message: cloudinaryResult ? 'Video uploaded to Cloudinary successfully' : 'Video uploaded to local storage successfully',
      data: {
        filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: videoUrl,
        fullUrl: fullUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload video' });
  }
});

// Upload profile image (for all authenticated users)
router.post('/profile-image', verifyToken, uploadSingle, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    console.log(`[Upload] Received file: ${req.file.originalname}, size: ${req.file.size}`);
    const filename = `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
    console.log(`[Upload] Generated filename: ${filename}`);
    let imageUrl;
    let cloudinaryResult = null;

    if (isCloudinaryConfigured()) {
      try {
        const uploadToCloudinary = (buffer) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'bible-project/profiles', resource_type: 'image' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            streamifier.createReadStream(buffer).pipe(uploadStream);
          });
        };
        cloudinaryResult = await uploadToCloudinary(req.file.buffer);
        imageUrl = cloudinaryResult.secure_url;
      } catch (cloudinaryError) {
        console.warn('Cloudinary upload failed, falling back to local storage:', cloudinaryError);
      }
    }

    if (!imageUrl) {
      await saveBufferToDisk(req.file.buffer, filename, 'profiles');
      imageUrl = `/api/upload/profiles/${filename}`;
    }

    // Save to media collection
    await prisma.media.create({
      data: {
        filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: cloudinaryResult?.secure_url || null,
        publicId: cloudinaryResult?.public_id || null,
        folder: 'profiles'
      }
    });

    const fullUrl = imageUrl.startsWith('http') ? imageUrl : getFullUrl(req, imageUrl);
    console.log(`[Upload] Profile image upload success. URL: ${fullUrl}`);

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        url: fullUrl,
        filename: filename
      }
    });
  } catch (error) {
    console.error('[Upload] Profile upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload profile image' });
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

// Serve uploaded profile images
router.get('/profiles/:filename', async (req, res) => {
  await serveFile(req, res, 'profiles');
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
      if (media.data) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Content-Type', media.mimeType);
        res.header('Cache-Control', 'public, max-age=31536000');
        return res.send(media.data);
      }
      // If media exists but no data/url, continue to local disk fallback
      console.log(`[Upload] Media found in DB but no data, falling back to disk for ${filename}`);
    }

    // 2. Fallback to local Disk (legacy files)
    // Go up two levels from routes/upload.js to api/ then into uploads
    const filePath = path.join(__dirname, '../../uploads', folder, filename);

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
