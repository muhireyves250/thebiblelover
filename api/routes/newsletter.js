import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Check if subscriber already exists
        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        });

        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already subscribed'
                });
            } else {
                // Re-activate
                const reactivated = await prisma.newsletterSubscriber.update({
                    where: { email },
                    data: { isActive: true }
                });
                return res.json({
                    success: true,
                    message: 'Welcome back! You have been re-subscribed.',
                    data: { subscriber: reactivated }
                });
            }
        }

        const subscriber = await prisma.newsletterSubscriber.create({
            data: { email }
        });

        // External Service Integration (Brevo / Mailchimp Bridge)
        if (process.env.NEWSLETTER_API_KEY) {
            try {
                // Example for Brevo (Sendinblue)
                await fetch('https://api.brevo.com/v3/contacts', {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'content-type': 'application/json',
                        'api-key': process.env.NEWSLETTER_API_KEY
                    },
                    body: JSON.stringify({
                        email: email,
                        listIds: [parseInt(process.env.NEWSLETTER_LIST_ID) || 1],
                        updateEnabled: true
                    })
                });
                console.log(`Newsletter automation: ${email} synced to Brevo.`);
            } catch (err) {
                console.error('Newsletter automation error:', err.message);
                // We don't fail the request if the external sync fails, but we log it
            }
        }

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to the newsletter!',
            data: { subscriber }
        });
    } catch (err) {
        next(err);
    }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        const subscriber = await prisma.newsletterSubscriber.update({
            where: { email },
            data: { isActive: false }
        });

        res.json({
            success: true,
            message: 'You have been successfully unsubscribed.',
            data: { subscriber }
        });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }
        next(err);
    }
});

// Get all subscribers (Admin only)
router.get('/subscribers', verifyToken, async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const subscribers = await prisma.newsletterSubscriber.findMany({
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: { subscribers }
        });
    } catch (err) {
        next(err);
    }
});

export default router;
