import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { validateDonation } from '../middleware/validation.js';

const router = express.Router();

// Submit a donation pledge (public). No payment processor is wired up —
// this records donor intent as PENDING so it can be followed up on
// manually (e.g. bank transfer, PayPal, in person).
router.post('/', validateDonation, async (req, res) => {
  try {
    const donationData = {
      ...req.body,
      status: 'PENDING',
      paymentMethod: req.body.paymentMethod || 'OTHER'
    };
    delete donationData.paymentIntentId;
    delete donationData.paymentId;

    const donation = await prisma.donation.create({
      data: donationData
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your generous pledge! We will be in touch shortly.',
      data: {
        donation: {
          id: donation.id,
          amount: donation.amount,
          currency: donation.currency,
          status: donation.status,
          createdAt: donation.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Donation submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process donation',
      error: error.message
    });
  }
});

// Get recent public donations
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const donations = await prisma.donation.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        donorName: true,
        amount: true,
        message: true,
        createdAt: true,
        isAnonymous: true
      }
    });

    res.json({
      success: true,
      data: { donations }
    });
  } catch (error) {
    console.error('Get recent donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent donations',
      error: error.message
    });
  }
});

// Get all donations (admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const where = {};
    if (status) where.status = status.toUpperCase();

    const skip = (page - 1) * limit;

    const donations = await prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.donation.count({ where });

    res.json({
      success: true,
      data: {
        donations,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalDonations: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations',
      error: error.message
    });
  }
});

// Get single donation (admin only)
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: req.params.id }
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.json({
      success: true,
      data: { donation }
    });
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation',
      error: error.message
    });
  }
});

// Update donation status (admin only)
router.put('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const donation = await prisma.donation.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Donation status updated successfully',
      data: { donation }
    });
  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update donation status',
      error: error.message
    });
  }
});

// Delete donation (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: req.params.id }
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    await prisma.donation.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete donation',
      error: error.message
    });
  }
});

// Get donation statistics (admin only)
router.get('/admin/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const totalDonations = await prisma.donation.count();
    const completedDonations = await prisma.donation.count({
      where: { status: 'COMPLETED' }
    });
    const pendingDonations = await prisma.donation.count({
      where: { status: 'PENDING' }
    });

    const totalAmountResult = await prisma.donation.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    });

    const recentDonations = await prisma.donation.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        donorName: true,
        amount: true,
        currency: true,
        createdAt: true,
        isAnonymous: true
      }
    });

    res.json({
      success: true,
      data: {
        totalDonations,
        completedDonations,
        pendingDonations,
        totalAmount: totalAmountResult._sum.amount || 0,
        recentDonations
      }
    });
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation statistics',
      error: error.message
    });
  }
});

export default router;