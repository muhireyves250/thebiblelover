import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create a prayer request
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, content, category, isAnonymous } = req.body;
        const userId = req.user.id;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const prayerRequest = await prisma.prayerRequest.create({
            data: {
                title,
                content,
                category: category || 'GENERAL',
                isAnonymous: isAnonymous || false,
                userId
            },
            include: {
                user: {
                    select: {
                        name: true,
                        profileImage: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: prayerRequest
        });
    } catch (error) {
        console.error('Create prayer request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create prayer request',
            error: error.message
        });
    }
});

// Get all public prayer requests
router.get('/', async (req, res) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {
            status: 'ACTIVE'
        };

        if (category && category !== 'ALL') {
            where.category = category;
        }

        const [requests, total] = await Promise.all([
            prisma.prayerRequest.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            profileImage: true
                        }
                    },
                    _count: {
                        select: {
                            supports: true
                        }
                    }
                }
            }),
            prisma.prayerRequest.count({ where })
        ]);

        // If an anonymous request, hide user info
        const sanitizedRequests = requests.map(req => {
            if (req.isAnonymous) {
                return {
                    ...req,
                    user: { name: 'Anonymous', profileImage: null }
                };
            }
            return req;
        });

        res.json({
            success: true,
            data: {
                requests: sanitizedRequests,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get prayer requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch prayer requests',
            error: error.message
        });
    }
});

// Support a prayer request ("I'm Praying")
router.post('/:id/pray', verifyToken, async (req, res) => {
    try {
        const prayerRequestId = req.params.id;
        const userId = req.user.id;

        // Check if already supporting
        const existingSupport = await prisma.prayerSupport.findUnique({
            where: {
                userId_prayerRequestId: {
                    userId,
                    prayerRequestId
                }
            }
        });

        if (existingSupport) {
            // Toggle off (un-pray)
            await prisma.prayerSupport.delete({
                where: {
                    id: existingSupport.id
                }
            });
            return res.json({
                success: true,
                message: 'Support removed',
                data: { supported: false }
            });
        }

        // Toggle on
        const support = await prisma.prayerSupport.create({
            data: {
                userId,
                prayerRequestId
            },
            include: {
                user: { select: { name: true } },
                prayerRequest: { select: { userId: true, title: true, isAnonymous: true } }
            }
        });

        // Notify author if supporter is not the author
        const prayerRequest = support.prayerRequest;
        if (prayerRequest.userId !== userId) {
            await prisma.notification.create({
                data: {
                    userId: prayerRequest.userId,
                    type: 'PRAYER_SUPPORT',
                    title: 'Someone is Praying for You',
                    message: `${support.user.name} is praying for: "${prayerRequest.title}"`,
                    link: '/prayer-wall'
                }
            });
        }

        res.json({
            success: true,
            message: 'Thank you for praying!',
            data: { supported: true }
        });
    } catch (error) {
        console.error('Support prayer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process support',
            error: error.message
        });
    }
});

// Get user's own prayer requests
router.get('/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await prisma.prayerRequest.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: {
                        supports: true
                    }
                }
            }
        });

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Get my prayer requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your prayer requests',
            error: error.message
        });
    }
});

// Toggle prayer request as answered (Praise Report)
router.patch('/:id/praise', verifyToken, async (req, res) => {
    try {
        const prayerRequestId = req.params.id;
        const userId = req.user.id;

        const request = await prisma.prayerRequest.findUnique({
            where: { id: prayerRequestId }
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Prayer request not found' });
        }

        if (request.userId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const updatedRequest = await prisma.prayerRequest.update({
            where: { id: prayerRequestId },
            data: {
                status: request.status === 'ANSWERED' ? 'ACTIVE' : 'ANSWERED'
            }
        });

        res.json({
            success: true,
            message: updatedRequest.status === 'ANSWERED' ? 'Praise report shared!' : 'Returned to active prayers',
            data: updatedRequest
        });
    } catch (error) {
        console.error('Toggle praise error:', error);
        res.status(500).json({ success: false, message: 'Failed to update prayer status' });
    }
});

// Admin: Get all prayer requests
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { status, category, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status && status !== 'ALL') where.status = status;
        if (category && category !== 'ALL') where.category = category;

        const [requests, total] = await Promise.all([
            prisma.prayerRequest.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true, email: true, profileImage: true } },
                    _count: { select: { supports: true } }
                }
            }),
            prisma.prayerRequest.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                requests,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Admin get prayer requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch prayer requests' });
    }
});

// Admin: Delete prayer request
router.delete('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        await prisma.prayerRequest.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Prayer request deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete prayer request' });
    }
});

export default router;
