import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Get platform-wide statistics summary (public)
router.get('/summary', async (req, res) => {
  try {
    const [
      totalUsers,
      totalTopics,
      totalInsights,
      totalPrayers,
      totalDonations,
      totalDevotionals,
      totalEvents
    ] = await Promise.all([
      prisma.user.count(),
      prisma.forumTopic.count(),
      prisma.forumPost.count(),
      prisma.prayerSupport.count(),
      prisma.donation.count({ where: { status: 'COMPLETED' } }),
      prisma.devotional.count(),
      prisma.event.count()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTopics,
        totalInsights,
        totalPrayers,
        totalDonations,
        totalDevotionals,
        totalEvents,
        // Active souls calculation: users + recent activity factor
        soulsActive: totalUsers + Math.floor(totalInsights / 2) + totalPrayers
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics',
      error: error.message
    });
  }
});

export default router;
