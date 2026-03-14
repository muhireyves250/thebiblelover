import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all forum categories with stats
router.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.forumCategory.findMany({
            orderBy: { order: 'asc' },
            include: {
                _count: {
                    select: { topics: true }
                },
                topics: {
                    take: 1,
                    orderBy: { updatedAt: 'desc' },
                    include: {
                        author: {
                            select: { name: true, profileImage: true }
                        }
                    }
                }
            }
        });

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
});

// Get topics in a category (paginated)
router.get('/categories/:id/topics', async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [topics, total] = await Promise.all([
            prisma.forumTopic.findMany({
                where: { categoryId },
                skip,
                take: parseInt(limit),
                orderBy: [
                    { isSticky: 'desc' },
                    { updatedAt: 'desc' }
                ],
                include: {
                    author: {
                        select: { name: true, profileImage: true }
                    },
                    _count: {
                        select: { posts: true }
                    }
                }
            }),
            prisma.forumTopic.count({ where: { categoryId } })
        ]);

        res.json({
            success: true,
            data: {
                topics,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get topics error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch topics' });
    }
});

// Get a single topic and its posts
router.get('/topics/:id', async (req, res) => {
    try {
        const topicId = req.params.id;

        // Increment views
        await prisma.forumTopic.update({
            where: { id: topicId },
            data: { views: { increment: 1 } }
        });

        const topic = await prisma.forumTopic.findUnique({
            where: { id: topicId },
            include: {
                author: {
                    select: { 
                        name: true, 
                        profileImage: true,
                        _count: {
                            select: {
                                forumPosts: true,
                                prayerSupports: true
                            }
                        }
                    }
                },
                category: true,
                posts: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        author: {
                            select: { 
                                name: true, 
                                profileImage: true, 
                                role: true,
                                _count: {
                                    select: {
                                        forumPosts: true,
                                        prayerSupports: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!topic) {
            return res.status(404).json({ success: false, message: 'Topic not found' });
        }

        res.json({
            success: true,
            data: topic
        });
    } catch (error) {
        console.error('Get topic error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch topic' });
    }
});

// Create a new topic
router.post('/topics', verifyToken, async (req, res) => {
    try {
        const { categoryId, title, content } = req.body;
        const authorId = req.user.id;

        if (!categoryId || !title || !content) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const topic = await prisma.forumTopic.create({
            data: {
                categoryId,
                authorId,
                title,
                content
            }
        });

        res.status(201).json({
            success: true,
            data: topic
        });
    } catch (error) {
        console.error('Create topic error:', error);
        res.status(500).json({ success: false, message: 'Failed to create topic' });
    }
});

// Reply to a topic
router.post('/topics/:id/posts', verifyToken, async (req, res) => {
    try {
        const topicId = req.params.id;
        const { content } = req.body;
        const authorId = req.user.id;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }

        // Check if topic exists and is not locked
        const topic = await prisma.forumTopic.findUnique({ where: { id: topicId } });
        if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
        if (topic.isLocked) return res.status(403).json({ success: false, message: 'Topic is locked' });

        const post = await prisma.forumPost.create({
            data: {
                topicId,
                authorId,
                content
            },
            include: {
                author: {
                    select: { name: true, profileImage: true }
                }
            }
        });

        // Update topic's updatedAt timestamp
        await prisma.forumTopic.update({
            where: { id: topicId },
            data: { updatedAt: new Date() }
        });

        // Notify topic author if replier is not the author
        if (topic.authorId !== authorId) {
            await prisma.notification.create({
                data: {
                    userId: topic.authorId,
                    type: 'FORUM_REPLY',
                    title: 'New Forum Reply',
                    message: `${post.author.name} replied to your topic: "${topic.title}"`,
                    link: `/forum/topic/${topicId}`
                }
            });
        }

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ success: false, message: 'Failed to post reply' });
    }
});

// ... existing ...

// Delete a post (Admin or Author)
router.delete('/posts/:id', verifyToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const isAdminUser = req.user.role === 'ADMIN';

        const post = await prisma.forumPost.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        if (post.authorId !== userId && !isAdminUser) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await prisma.forumPost.delete({ where: { id: postId } });

        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete post' });
    }
});

// Admin: Categories CRUD
router.post('/categories', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { name, description, icon, order = 0 } = req.body;
        const category = await prisma.forumCategory.create({
            data: { name, description, icon, order }
        });
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create category' });
    }
});

router.put('/categories/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { name, description, icon, order } = req.body;
        const category = await prisma.forumCategory.update({
            where: { id: req.params.id },
            data: { name, description, icon, order }
        });
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update category' });
    }
});

router.delete('/categories/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        await prisma.forumCategory.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete category' });
    }
});

// Admin: Delete Topic
router.delete('/topics/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        await prisma.forumTopic.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Topic deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete topic' });
    }
});

export default router;
