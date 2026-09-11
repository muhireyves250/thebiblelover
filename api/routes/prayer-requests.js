import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Create a prayer request - works for signed-in users and guests alike.
// A guest must supply a name and email so the request has an author; a
// signed-in user's account takes precedence over anything in the body.
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { title, content, category, isAnonymous, guestName, guestEmail } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        if (!req.user && (!guestName || !guestEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your name and email, or log in.'
            });
        }

        const prayerRequest = await prisma.prayerRequest.create({
            data: {
                title,
                content,
                category: category || 'GENERAL',
                isAnonymous: isAnonymous || false,
                userId: req.user?.id,
                guestName: req.user ? null : guestName,
                guestEmail: req.user ? null : guestEmail
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

        // Resolve a display name/avatar from either the account or the
        // guest-submitted name, then hide it entirely for anonymous posts.
        // Also fold guest "I'm Praying" taps (not individually tracked) into
        // the same support count the frontend already displays.
        const sanitizedRequests = requests.map(req => {
            const withTotal = {
                ...req,
                _count: { supports: req._count.supports + req.guestSupports }
            };
            if (withTotal.isAnonymous) {
                return {
                    ...withTotal,
                    user: { name: 'Anonymous', profileImage: null }
                };
            }
            if (!withTotal.user && withTotal.guestName) {
                return {
                    ...withTotal,
                    user: { name: withTotal.guestName, profileImage: null }
                };
            }
            return withTotal;
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

// Support a prayer request ("I'm Praying") - works for signed-in users and
// guests alike. A signed-in user's support is tracked per-account so it can
// be toggled off again; a guest's tap isn't individually identifiable, so
// it just moves a shared counter up or down based on the client's own
// locally-remembered state (the `praying` flag in the request body).
router.post('/:id/pray', optionalAuth, async (req, res) => {
    try {
        const prayerRequestId = req.params.id;

        if (!req.user) {
            const { praying } = req.body;
            let updated;
            if (praying) {
                updated = await prisma.prayerRequest.update({
                    where: { id: prayerRequestId },
                    data: { guestSupports: { increment: 1 } }
                });
            } else {
                const current = await prisma.prayerRequest.findUnique({ where: { id: prayerRequestId } });
                updated = await prisma.prayerRequest.update({
                    where: { id: prayerRequestId },
                    data: { guestSupports: Math.max(0, (current?.guestSupports || 0) - 1) }
                });
            }
            return res.json({
                success: true,
                message: praying ? 'Thank you for praying!' : 'Support removed',
                data: { supported: !!praying, guestSupports: updated.guestSupports }
            });
        }

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

        // Notify author if supporter is not the author - a guest-submitted
        // request has no userId to notify, so skip in that case.
        const prayerRequest = support.prayerRequest;
        if (prayerRequest.userId && prayerRequest.userId !== userId) {
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
