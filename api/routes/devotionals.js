import express from 'express';
const router = express.Router();
import { prisma } from '../lib/prisma.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

// GET today's devotional
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const devotional = await prisma.devotional.findFirst({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow
                }
            },
            include: {
                author: {
                    select: {
                        name: true,
                        profileImage: true
                    }
                },
                comments: {
                    where: { isApproved: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!devotional) {
            // Fallback: get the most recent devotional if none for today
            const recentDevotional = await prisma.devotional.findFirst({
                orderBy: { date: 'desc' },
                include: {
                    author: {
                        select: {
                            name: true,
                            profileImage: true
                        }
                    },
                    comments: {
                        where: { isApproved: true },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });

            if (!recentDevotional) {
                 return res.status(404).json({ success: false, message: 'No devotional found' });
            }
            return res.json({ success: true, data: recentDevotional });
        }

        res.json({ success: true, data: devotional });
    } catch (error) {
        console.error('Error fetching today devotional:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET devotional archive
router.get('/archive', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [devotionals, total] = await Promise.all([
            prisma.devotional.findMany({
                orderBy: { date: 'desc' },
                skip,
                take: limit,
                include: {
                    author: {
                        select: { name: true }
                    }
                }
            }),
            prisma.devotional.count()
        ]);

        res.json({
            success: true,
            data: devotionals,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Error fetching devotional archive:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST new devotional (Admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { date, title, content, scripture, reflectionQuestions } = req.body;

        // Normalize date to midnight
        const devotionalDate = new Date(date);
        devotionalDate.setHours(0, 0, 0, 0);

        const devotional = await prisma.devotional.create({
            data: {
                date: devotionalDate,
                title,
                content,
                scripture,
                reflectionQuestions,
                authorId: req.user.id
            }
        });

        res.status(201).json({ success: true, data: devotional });
    } catch (error) {
        console.error('Error creating devotional:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, message: 'A devotional already exists for this date' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT update devotional (Admin)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { date, title, content, scripture, reflectionQuestions } = req.body;
        const devotionalDate = date ? new Date(date) : undefined;
        if (devotionalDate) devotionalDate.setHours(0, 0, 0, 0);

        const updated = await prisma.devotional.update({
            where: { id: req.params.id },
            data: {
                date: devotionalDate,
                title,
                content,
                scripture,
                reflectionQuestions
            }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating devotional:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE devotional (Admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        await prisma.devotional.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Devotional deleted' });
    } catch (error) {
        console.error('Error deleting devotional:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST a comment on a devotional
router.post('/:id/comments', verifyToken, async (req, res) => {
    try {
        const { content } = req.body;
        const { id: devotionalId } = req.params;

        if (!content) return res.status(400).json({ success: false, message: 'Comment content required' });

        const comment = await prisma.comment.create({
            data: {
                content,
                authorName: req.user.name,
                authorEmail: req.user.email,
                devotionalId,
                isApproved: true // Auto-approve for now for "polish" bundle simplicity
            }
        });

        res.status(201).json({ success: true, data: comment });
    } catch (error) {
        console.error('Error posting devotional comment:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
