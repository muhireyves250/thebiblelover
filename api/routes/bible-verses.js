import express from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma.js';
import { verifyToken } from '../middleware/auth.js';
import { validateBibleVerse, validateBibleVerseUpdate } from '../middleware/validation.js';

const router = express.Router();

// Helper function to convert static URLs to Bible verse image API URLs
const convertToApiUrl = (imageUrl, req = null) => {
  if (!imageUrl) return imageUrl;
  
  let convertedUrl = imageUrl;
  
  if (imageUrl.includes('/api/upload/images/')) {
    const filename = imageUrl.split('/api/upload/images/')[1];
    convertedUrl = `/api/bible-verses/images/${filename}`;
  } else if (imageUrl.includes('/uploads/images/')) {
    const filename = imageUrl.split('/uploads/images/')[1];
    convertedUrl = `/api/bible-verses/images/${filename}`;
  }
  
  // Convert to full URL if request object is provided
  if (req && convertedUrl.startsWith('/')) {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';
    convertedUrl = `${protocol}://${host}${convertedUrl}`;
  }
  
  return convertedUrl;
};

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, route: 'bible-verses', status: 'OK' });
});

// Share Bible verse endpoint
router.post('/:id/share', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      shareType = 'COPY_LINK', 
      platform = null, 
      recipientEmail = null, 
      shareUrl = null 
    } = req.body;

    // Get client IP and user agent for analytics
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
      (req.connection.socket ? req.connection.socket.remoteAddress : null) || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Validate share type
    const validShareTypes = ['SOCIAL_MEDIA', 'EMAIL', 'COPY_LINK', 'WHATSAPP', 'TELEGRAM', 'OTHER'];
    if (!validShareTypes.includes(shareType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid share type'
      });
    }

    // Check if verse exists
    const verse = await prisma.bibleVerse.findUnique({
      where: { id },
      select: { id: true, book: true, chapter: true, verse: true, text: true, translation: true }
    });

    if (!verse) {
      return res.status(404).json({
        success: false,
        message: 'Bible verse not found'
      });
    }

    // Create share record
    const shareRecord = await prisma.verseShare.create({
      data: {
        verseId: id,
        shareType: shareType,
        platform: platform,
        recipientEmail: recipientEmail,
        shareUrl: shareUrl,
        ipAddress: ipAddress,
        userAgent: userAgent,
        isSuccessful: true
      }
    });

    // Generate share URL if not provided
    let finalShareUrl = shareUrl;
    if (!finalShareUrl) {
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:5000';
      finalShareUrl = `${protocol}://${host}/bible-verse/${id}`;
    }

    // Generate share text
    const shareText = `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse} (${verse.translation})`;
    const shareDescription = `Check out this inspiring Bible verse from The Bible Lover`;

    // Generate platform-specific share URLs
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalShareUrl)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(finalShareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(finalShareUrl)}&title=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${finalShareUrl}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(finalShareUrl)}&text=${encodeURIComponent(shareText)}`,
      email: `mailto:?subject=${encodeURIComponent(`Bible Verse: ${verse.book} ${verse.chapter}:${verse.verse}`)}&body=${encodeURIComponent(`${shareDescription}\n\n${shareText}\n\nRead more: ${finalShareUrl}`)}`
    };

    res.json({
      success: true,
      message: 'Verse shared successfully',
      data: {
        shareId: shareRecord.id,
        shareUrl: finalShareUrl,
        shareText: shareText,
        shareDescription: shareDescription,
        platformUrls: shareUrls,
        verse: {
          id: verse.id,
          reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
          text: verse.text,
          translation: verse.translation
        }
      }
    });

  } catch (err) {
    console.error('Error sharing verse:', err);
    next(err);
  }
});

// Get share statistics for a verse (admin only)
router.get('/:id/shares', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, shareType } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if verse exists
    const verse = await prisma.bibleVerse.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!verse) {
      return res.status(404).json({
        success: false,
        message: 'Bible verse not found'
      });
    }

    // Build where clause
    const where = { verseId: id };
    if (shareType) {
      where.shareType = shareType;
    }

    // Get shares with pagination
    const [shares, totalShares] = await Promise.all([
      prisma.verseShare.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          shareType: true,
          platform: true,
          recipientEmail: true,
          shareUrl: true,
          isSuccessful: true,
          createdAt: true
        }
      }),
      prisma.verseShare.count({ where })
    ]);

    // Get share statistics
    const shareStats = await prisma.verseShare.groupBy({
      by: ['shareType'],
      where: { verseId: id },
      _count: { shareType: true }
    });

    const totalCount = await prisma.verseShare.count({ where: { verseId: id } });

    res.json({
      success: true,
      data: {
        shares,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalShares,
          pages: Math.ceil(totalShares / parseInt(limit))
        },
        statistics: {
          totalShares: totalCount,
          byType: shareStats.reduce((acc, stat) => {
            acc[stat.shareType] = stat._count.shareType;
            return acc;
          }, {})
        }
      }
    });

  } catch (err) {
    console.error('Error fetching verse shares:', err);
    next(err);
  }
});

// Get all Bible verses (public)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, featured, includeInactive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    
    // If includeInactive is not true, only show active verses (default behavior)
    if (includeInactive !== 'true') {
      where.isActive = true;
    }
    
    if (featured === 'true') {
      where.isFeatured = true;
    }

    const [verses, total] = await Promise.all([
      prisma.bibleVerse.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.bibleVerse.count({ where })
    ]);

    // Convert image URLs to API URLs
    const versesWithApiUrls = verses.map(verse => ({
      ...verse,
      image: verse.image ? convertToApiUrl(verse.image, req) : verse.image
    }));

    res.json({
      success: true,
      data: {
        verses: versesWithApiUrls,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get featured Bible verse (public)
router.get('/featured', async (req, res, next) => {
  try {
    const verse = await prisma.bibleVerse.findFirst({
      where: { 
        isActive: true,
        isFeatured: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!verse) {
      // Fallback to latest active verse
      const fallbackVerse = await prisma.bibleVerse.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
      
      if (fallbackVerse) {
        // Transform the data to match frontend expectations
        const transformedVerse = {
          ...fallbackVerse,
          verse: fallbackVerse.text,
          reference: `${fallbackVerse.book} ${fallbackVerse.chapter}:${fallbackVerse.verse}`,
          image: fallbackVerse.image ? convertToApiUrl(fallbackVerse.image, req) : fallbackVerse.image
        };
        return res.json({
          success: true,
          data: { verse: transformedVerse }
        });
      }
      
      return res.json({
        success: true,
        data: { verse: null }
      });
    }

    // Transform the data to match frontend expectations
    const transformedVerse = {
      ...verse,
      verse: verse.text,
      reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
      image: verse.image ? convertToApiUrl(verse.image, req) : verse.image
    };

    res.json({
      success: true,
      data: { verse: transformedVerse }
    });
  } catch (err) {
    next(err);
  }
});

// Get single Bible verse (public)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const verse = await prisma.bibleVerse.findUnique({
      where: { id }
    });

    if (!verse) {
      return res.status(404).json({
        success: false,
        message: 'Bible verse not found'
      });
    }

    res.json({
      success: true,
      data: { verse }
    });
  } catch (err) {
    next(err);
  }
});

// Create Bible verse (admin only)
router.post('/', verifyToken, validateBibleVerse, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { text, book, chapter, verse, translation, image, isActive, isFeatured } = req.body;
    
    // If setting as active, deactivate all other verses first
    if (isActive) {
      await prisma.bibleVerse.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }
    
    const newVerse = await prisma.bibleVerse.create({
      data: {
        text,
        book,
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        translation,
        image,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bible verse created successfully',
      data: { verse: newVerse }
    });
  } catch (err) {
    next(err);
  }
});

// Update Bible verse (admin only)
router.put('/:id', verifyToken, validateBibleVerseUpdate, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const existingVerse = await prisma.bibleVerse.findUnique({
      where: { id }
    });

    if (!existingVerse) {
      return res.status(404).json({
        success: false,
        message: 'Bible verse not found'
      });
    }

    // If setting as active, deactivate all other verses first
    if (updateData.isActive === true) {
      await prisma.bibleVerse.updateMany({
        where: { 
          isActive: true,
          id: { not: id } // Don't deactivate the current verse
        },
        data: { isActive: false }
      });
    }

    const updatedVerse = await prisma.bibleVerse.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Bible verse updated successfully',
      data: { verse: updatedVerse }
    });
  } catch (err) {
    next(err);
  }
});

// Delete Bible verse (admin only)
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;

    const existingVerse = await prisma.bibleVerse.findUnique({
      where: { id }
    });

    if (!existingVerse) {
      return res.status(404).json({
        success: false,
        message: 'Bible verse not found'
      });
    }

    await prisma.bibleVerse.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Bible verse deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

// Share Bible verse (increment share count)
router.post('/:id/share', async (req, res, next) => {
  try {
    const { id } = req.params;

    const verse = await prisma.bibleVerse.findUnique({
      where: { id }
    });

    if (!verse) {
      return res.status(404).json({
        success: false,
        message: 'Bible verse not found'
      });
    }

    const updatedVerse = await prisma.bibleVerse.update({
      where: { id },
      data: {
        shareCount: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      message: 'Share count updated',
      data: { shareCount: updatedVerse.shareCount }
    });
  } catch (err) {
    next(err);
  }
});

// Serve bible verse images with proper CORS headers
router.get('/images/:filename', (req, res, next) => {
  try {
    const filename = req.params.filename;
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }
    
    const imagePath = path.join(process.cwd(), 'uploads', 'images', filename);
    
    // Set comprehensive CORS headers specifically for bible verse images
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'false');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    res.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.header('Content-Type', 'image/png'); // Set proper content type
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Check if file exists first
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: 'Bible verse image not found'
      });
    }
    
    // Send the file
    res.sendFile(imagePath, (err) => {
      if (err && !res.headersSent) {
        console.error('Error serving bible verse image:', err);
        res.status(500).json({
          success: false,
          message: 'Failed to serve bible verse image'
        });
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
