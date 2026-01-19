import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/settings.json');

// Helper to read settings
async function getSettings() {
  try {
    // Try to get all settings from database
    const dbSettings = await prisma.systemSetting.findMany();

    // If database is empty, try to migrate from JSON file
    if (dbSettings.length === 0) {
      return await migrateFromJson();
    }

    // Convert array to object
    const settingsObj = {};
    dbSettings.forEach(s => {
      settingsObj[s.key] = s.settings;
    });

    // Merge with defaults for missing keys and fields
    const finalSettings = { ...defaultSettings };
    Object.keys(settingsObj).forEach(key => {
      if (typeof settingsObj[key] === 'object' && settingsObj[key] !== null && !Array.isArray(settingsObj[key])) {
        finalSettings[key] = { ...finalSettings[key], ...settingsObj[key] };
      } else {
        finalSettings[key] = settingsObj[key];
      }
    });

    return finalSettings;
  } catch (error) {
    console.error('Error reading settings from DB:', error);
    return defaultSettings;
  }
}

// Migration logic
async function migrateFromJson() {
  try {
    let initialSettings = defaultSettings;

    try {
      const fileData = await fs.readFile(DATA_FILE, 'utf8');
      const jsonSettings = JSON.parse(fileData);
      initialSettings = { ...defaultSettings, ...jsonSettings };
      console.log('✅ Found settings.json, migrating to database...');
    } catch (err) {
      console.log('ℹ️ No settings.json found, using defaults.');
    }

    // Save each category to DB
    for (const [key, value] of Object.entries(initialSettings)) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { settings: value },
        create: { key, settings: value }
      });
    }

    console.log('✅ Settings migrated to Neon database.');
    return initialSettings;
  } catch (error) {
    console.error('Migration error:', error);
    return defaultSettings;
  }
}

// Helper to save setting category
async function saveSettingCategory(key, settings) {
  try {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { settings },
      create: { key, settings }
    });
    return true;
  } catch (error) {
    console.error(`Error saving setting category ${key}:`, error);
    return false;
  }
}

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
  },
  aboutSection: {
    title: "About Us",
    content: "Our company and culture are crafted for a delightful experience. We believe in thoughtful design, clear communication, and building products that help people grow.",
    imageUrl: "https://images.pexels.com/photos/3182763/pexels-photo-3182763.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  storySection: {
    title: "Our Story",
    content: "It all started in 2004 with a simple observation: people wanted helpful information, not interruptions. Today, we're proud to support millions of users as they grow with confidence.",
    imageUrl: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  missionSection: {
    title: "Our Mission",
    content: "We believe in growing better—aligning your success with the success of your customers. Our mission is to build tools that deliver real value and lasting impact.",
    imageUrl: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  heroSection: {
    videoUrl: '',
    imageUrl: 'https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1',
    title: 'THE BIBLE LOVER',
    content: 'READ ALL ABOUT IT'
  },
  whatsappSettings: {
    phoneNumber: "1234567890",
    message: "Hello! I would like to know more about your services.",
    enabled: true
  },
  footerSettings: {
    description: "Sharing the joy of reading and faith through thoughtful book reviews, inspiring content, and meaningful discussions about literature and spirituality.",
    email: "hello@thebiblelover.com",
    location: "New York, NY",
    responseTime: "Response within 24-48 hours",
    copyrightText: "© 2024 The Bible Lover. All rights reserved.",
    madeWithText: "Made with for book lovers",
    facebook: "#",
    twitter: "#",
    instagram: "#",
    linkedin: "#",
    youtube: "#",
    tiktok: "#",
    whatsapp: "#"
  }
};

// Get all settings (public)
router.get('/', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({
      success: true,
      data: {
        settings
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
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const settings = await getSettings();

    if (!settings[category]) {
      return res.status(404).json({
        success: false,
        message: 'Setting category not found'
      });
    }

    res.json({
      success: true,
      data: {
        category,
        settings: settings[category]
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

    const allSettings = await getSettings();
    const settings = allSettings[category] || {};

    // Validate category
    if (!['backgroundSettings', 'logoSettings', 'socialSettings', 'aboutSection', 'storySection', 'missionSection', 'whatsappSettings', 'heroSection', 'footerSettings'].includes(category)) {
      return res.status(404).json({
        success: false,
        message: 'Setting category not found or invalid'
      });
    }

    // Merge updates
    const updatedCategorySettings = { ...settings };

    switch (category) {
      case 'backgroundSettings':
        if (updates.imageUrl) updatedCategorySettings.imageUrl = updates.imageUrl;
        if (updates.opacity !== undefined) updatedCategorySettings.opacity = updates.opacity;
        if (updates.overlayColor) updatedCategorySettings.overlayColor = updates.overlayColor;
        break;

      case 'logoSettings':
        if (updates.logoUrl !== undefined) updatedCategorySettings.logoUrl = updates.logoUrl;
        if (updates.logoText) updatedCategorySettings.logoText = updates.logoText;
        if (updates.showText !== undefined) updatedCategorySettings.showText = updates.showText;
        break;

      case 'socialSettings':
        ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok'].forEach(platform => {
          if (updates[platform] !== undefined) updatedCategorySettings[platform] = updates[platform];
        });
        break;

      case 'aboutSection':
      case 'storySection':
      case 'missionSection':
        if (updates.title !== undefined) updatedCategorySettings.title = updates.title;
        if (updates.content !== undefined) updatedCategorySettings.content = updates.content;
        if (updates.imageUrl !== undefined) updatedCategorySettings.imageUrl = updates.imageUrl;
        break;

      case 'heroSection':
        if (updates.videoUrl !== undefined) updatedCategorySettings.videoUrl = updates.videoUrl;
        if (updates.imageUrl !== undefined) updatedCategorySettings.imageUrl = updates.imageUrl;
        if (updates.title !== undefined) updatedCategorySettings.title = updates.title;
        if (updates.content !== undefined) updatedCategorySettings.content = updates.content;
        break;

      case 'whatsappSettings':
        if (updates.phoneNumber !== undefined) updatedCategorySettings.phoneNumber = updates.phoneNumber;
        if (updates.message !== undefined) updatedCategorySettings.message = updates.message;
        if (updates.enabled !== undefined) updatedCategorySettings.enabled = updates.enabled;
        break;

      case 'footerSettings':
        if (updates.description !== undefined) updatedCategorySettings.description = updates.description;
        if (updates.email !== undefined) updatedCategorySettings.email = updates.email;
        if (updates.location !== undefined) updatedCategorySettings.location = updates.location;
        if (updates.responseTime !== undefined) updatedCategorySettings.responseTime = updates.responseTime;
        if (updates.copyrightText !== undefined) updatedCategorySettings.copyrightText = updates.copyrightText;
        if (updates.madeWithText !== undefined) updatedCategorySettings.madeWithText = updates.madeWithText;
        ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'whatsapp'].forEach(platform => {
          if (updates[platform] !== undefined) updatedCategorySettings[platform] = updates[platform];
        });
        break;
    }

    await saveSettingCategory(category, updatedCategorySettings);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        category,
        settings: updatedCategorySettings
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
    for (const [key, value] of Object.entries(defaultSettings)) {
      await saveSettingCategory(key, value);
    }

    res.json({
      success: true,
      message: 'Settings reset to default successfully',
      data: {
        settings: defaultSettings
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







