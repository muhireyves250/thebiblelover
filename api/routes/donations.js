import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { validateDonation } from '../middleware/validation.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Create Payment Intent (public)
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', donorName, email } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation amount'
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amounts in cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        donorName: donorName || 'Anonymous',
        email: email || '',
        message: req.body.message || '',
        isAnonymous: !donorName ? 'true' : 'false'
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
      }
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.message
    });
  }
});

// Submit donation after successful payment (public)
router.post('/', validateDonation, async (req, res) => {
  try {
    const { paymentIntentId, ...donationData } = req.body;

    // Optional: Verify payment intent status with Stripe
    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: 'Payment has not succeeded yet'
        });
      }
      donationData.status = 'COMPLETED';
      donationData.paymentId = paymentIntentId;
    }

    const donation = await prisma.donation.create({
      data: donationData
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your generous donation!',
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

// Stripe Webhook (public, but signature verified)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!sig || !endpointSecret) {
      throw new Error('Missing stripe-signature or STRIPE_WEBHOOK_SECRET');
    }

    // Use the raw body preserved in server.js
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    const paymentIntent = event.data.object;

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);

        // Find existing donation or create new one from metadata
        const existingDonation = await prisma.donation.findFirst({
          where: { paymentId: paymentIntent.id }
        });

        if (existingDonation) {
          await prisma.donation.update({
            where: { id: existingDonation.id },
            data: { status: 'COMPLETED' }
          });
        } else {
          // Create from metadata if it doesn't exist (browser session lost)
          const { donorName, email, message, isAnonymous } = paymentIntent.metadata;
          await prisma.donation.create({
            data: {
              amount: paymentIntent.amount / 100, // Convert cents to dollars
              currency: paymentIntent.currency.toUpperCase(),
              donorName: donorName,
              email: email,
              message: message,
              isAnonymous: isAnonymous === 'true',
              status: 'COMPLETED',
              paymentId: paymentIntent.id,
              paymentMethod: 'STRIPE'
            }
          });
        }
        break;

      case 'payment_intent.payment_failed':
        console.log(`PaymentIntent for ${paymentIntent.amount} failed.`);

        await prisma.donation.updateMany({
          where: { paymentId: paymentIntent.id },
          data: { status: 'FAILED' }
        });
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;