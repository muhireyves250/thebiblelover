import express from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Default settings (matching your frontend data structure)
const defaultSettings = {
  backgroundSettings: {
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    opacity: 0.4,
    overlayColor: "rgba(0, 0, 0, 0.3)"
  },
  logoSettings: {
    logoUrl: "",
    logoText: "The Bible Lover",
    showText: true
  },
  socialSettings: {
    facebook: "#",
    twitter: "#",
    instagram: "#",
    linkedin: "#",
    youtube: "#",
    tiktok: "#"
  }
};

// In-memory storage for settings (in production, use a database)
let siteSettings = { ...defaultSettings };

// Get all settings (public)
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        settings: siteSettings
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

// Get specific setting category (public)
router.get('/:category', (req, res) => {
  try {
    const { category } = req.params;
    
    if (!siteSettings[category]) {
      return res.status(404).json({
        success: false,
        message: 'Setting category not found'
      });
    }

    res.json({
      success: true,
      data: {
        category,
        settings: siteSettings[category]
      }
    });
  } catch (error) {
    console.error('Get setting category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch setting category',
      error: error.message
    });
  }
});

// Update settings (admin only)
router.put('/:category', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { category } = req.params;
    const updates = req.body;

    if (!siteSettings[category]) {
      return res.status(404).json({
        success: false,
        message: 'Setting category not found'
      });
    }

    // Validate and update settings
    switch (category) {
      case 'backgroundSettings':
        if (updates.imageUrl) siteSettings.backgroundSettings.imageUrl = updates.imageUrl;
        if (updates.opacity !== undefined) siteSettings.backgroundSettings.opacity = updates.opacity;
        if (updates.overlayColor) siteSettings.backgroundSettings.overlayColor = updates.overlayColor;
        break;

      case 'logoSettings':
        if (updates.logoUrl !== undefined) siteSettings.logoSettings.logoUrl = updates.logoUrl;
        if (updates.logoText) siteSettings.logoSettings.logoText = updates.logoText;
        if (updates.showText !== undefined) siteSettings.logoSettings.showText = updates.showText;
        break;

      case 'socialSettings':
        if (updates.facebook !== undefined) siteSettings.socialSettings.facebook = updates.facebook;
        if (updates.twitter !== undefined) siteSettings.socialSettings.twitter = updates.twitter;
        if (updates.instagram !== undefined) siteSettings.socialSettings.instagram = updates.instagram;
        if (updates.linkedin !== undefined) siteSettings.socialSettings.linkedin = updates.linkedin;
        if (updates.youtube !== undefined) siteSettings.socialSettings.youtube = updates.youtube;
        if (updates.tiktok !== undefined) siteSettings.socialSettings.tiktok = updates.tiktok;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid setting category'
        });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        category,
        settings: siteSettings[category]
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
});

// Reset settings to default (admin only)
router.post('/reset', verifyToken, requireAdmin, async (req, res) => {
  try {
    siteSettings = { ...defaultSettings };

    res.json({
      success: true,
      message: 'Settings reset to default successfully',
      data: {
        settings: siteSettings
      }
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings',
      error: error.message
    });
  }
});

export default router;







