import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Global Search
router.get('/', async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.json({ success: true, data: { posts: [], topics: [], devotionals: [], events: [] } });
    }

    try {
        const [posts, topics, devotionals] = await Promise.all([
            prisma.blogPost.findMany({
                where: {
                    status: 'PUBLISHED',
                    OR: [
                        { title: { contains: q } },
                        { content: { contains: q } },
                        { tags: { contains: q } }
                    ]
                },
                take: 5,
                select: { id: true, title: true, slug: true, excerpt: true, featuredImage: true, category: true, publishedAt: true }
            }),
            prisma.forumTopic.findMany({
                where: {
                    OR: [
                        { title: { contains: q } },
                        { content: { contains: q } }
                    ]
                },
                take: 5,
                include: {
                    author: { select: { name: true } },
                    _count: { select: { posts: true } }
                }
            }),
            prisma.devotional.findMany({
                where: {
                    OR: [
                        { title: { contains: q } },
                        { content: { contains: q } },
                        { scripture: { contains: q } }
                    ]
                },
                take: 5,
                select: { id: true, title: true, date: true, scripture: true }
            }),
            prisma.event.findMany({
                where: {
                    OR: [
                        { title: { contains: q } },
                        { description: { contains: q } },
                        { location: { contains: q } }
                    ]
                },
                take: 5,
                select: { id: true, title: true, date: true, location: true, type: true }
            })
        ]);

        res.json({
            success: true,
            data: { posts, topics, devotionals, events }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: 'Server error during search' });
    }
});

// Get personalized recommendations
router.get('/recommendations', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Simple recommendation logic: get posts from categories the user has liked
        const userLikes = await prisma.like.findMany({
            where: { userId },
            include: { post: { select: { category: true } } }
        });

        const likedCategories = [...new Set(userLikes.map(l => l.post.category))];

        let recommendations = [];
        if (likedCategories.length > 0) {
            recommendations = await prisma.blogPost.findMany({
                where: {
                    status: 'PUBLISHED',
                    category: { in: likedCategories },
                    NOT: { userLikes: { some: { userId } } }
                },
                take: 4,
                orderBy: { publishedAt: 'desc' }
            });
        }

        if (recommendations.length < 4) {
            const featured = await prisma.blogPost.findMany({
                where: {
                    status: 'PUBLISHED',
                    isFeatured: true,
                    NOT: { id: { in: recommendations.map(r => r.id) } }
                },
                take: 4 - recommendations.length
            });
            recommendations = [...recommendations, ...featured];
        }

        res.json({ success: true, data: recommendations });
    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get view history
router.get('/history', verifyToken, async (req, res) => {
    try {
        const history = await prisma.viewHistory.findMany({
            where: { userId: req.user.id },
            orderBy: { viewedAt: 'desc' },
            take: 10
        });
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Record view history
router.post('/history', verifyToken, async (req, res) => {
    const { type, itemId, title, link } = req.body;
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await prisma.viewHistory.findFirst({
            where: {
                userId: req.user.id,
                itemId,
                viewedAt: { gte: today }
            }
        });

        if (existing) {
            await prisma.viewHistory.update({
                where: { id: existing.id },
                data: { viewedAt: new Date() }
            });
        } else {
            await prisma.viewHistory.create({
                data: {
                    userId: req.user.id,
                    type,
                    itemId,
                    title,
                    link
                }
            });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
