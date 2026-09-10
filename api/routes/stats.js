import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Get platform-wide statistics summary (public)
router.get('/summary', async (req, res) => {
  try {
    const [
      totalUsers,
      totalPrayers,
      totalDonations,
      totalEvents
    ] = await Promise.all([
      prisma.user.count(),
      prisma.prayerSupport.count(),
      prisma.donation.count({ where: { status: 'COMPLETED' } }),
      prisma.event.count()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPrayers,
        totalDonations,
        totalEvents,
        // Active souls calculation: users + recent activity factor
        soulsActive: totalUsers + totalPrayers
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
