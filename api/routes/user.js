import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get member dashboard data (liked posts, saved verses)
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get liked posts
        const likedPosts = await prisma.like.findMany({
            where: { userId },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        excerpt: true,
                        featuredImage: true,
                        category: true,
                        publishedAt: true,
                        author: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get saved verses
        const savedVerses = await prisma.savedVerse.findMany({
            where: { userId },
            include: {
                verse: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Check newsletter status
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, receiveNewsletter: true, receivePrayerAlerts: true }
        });

        const newsletter = await prisma.newsletterSubscriber.findUnique({
            where: { email: user.email }
        });

        // Get forum activity (last 5)
        const forumActivity = await prisma.forumPost.findMany({
            where: { authorId: userId },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                topic: {
                    select: { id: true, title: true }
                }
            }
        });

        // Get joined events (upcoming)
        const joinedEvents = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                rsvps: {
                    where: { date: { gte: new Date() } },
                    take: 5,
                    orderBy: { date: 'asc' }
                }
            }
        });

        // Get stats for badges
        const [postsCount, prayerSupportsCount, eventsCount] = await Promise.all([
            prisma.forumPost.count({ where: { authorId: userId } }),
            prisma.prayerSupport.count({ where: { userId } }),
            prisma.user.findUnique({ where: { id: userId }, select: { _count: { select: { rsvps: true } } } })
        ]);

        // Get activity for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [dailyForumPosts, dailyPrayerSupports] = await Promise.all([
            prisma.forumPost.groupBy({
                by: ['createdAt'],
                where: {
                    authorId: userId,
                    createdAt: { gte: sevenDaysAgo }
                },
                _count: true,
            }),
            prisma.prayerSupport.groupBy({
                by: ['createdAt'],
                where: {
                    userId,
                    createdAt: { gte: sevenDaysAgo }
                },
                _count: true,
            })
        ]);

        // Process daily activity into a simple map { dayLabel: count }
        const activityMap = {};
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const label = days[d.getDay()];
            activityMap[label] = 0;
        }

        [...dailyForumPosts, ...dailyPrayerSupports].forEach(item => {
            const label = days[new Date(item.createdAt).getDay()];
            if (activityMap[label] !== undefined) {
                activityMap[label] += item._count || 1;
            }
        });

        const weeklyActivity = Object.entries(activityMap).map(([day, progress]) => ({ day, progress }));

        // Get donation history
        const donations = await prisma.donation.findMany({
            where: { 
                email: user.email,
                status: 'COMPLETED'
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        res.json({
            success: true,
            data: {
                likedPosts: likedPosts.map(l => l.post),
                savedVerses: savedVerses.map(sv => sv.verse),
                newsletterSubscription: !!newsletter?.isActive,
                forumActivity,
                joinedEvents: joinedEvents?.rsvps || [],
                weeklyActivity,
                donations,
                stats: {
                    posts: postsCount,
                    prayers: prayerSupportsCount,
                    events: eventsCount?._count.rsvps || 0
                },
                preferences: {
                    receiveNewsletter: user.receiveNewsletter,
                    receivePrayerAlerts: user.receivePrayerAlerts
                }
            }
        });
    } catch (error) {
        console.error('Member dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
});

// Save a verse to favorites
router.post('/saved-verses/:verseId', verifyToken, async (req, res) => {
    try {
        const { verseId } = req.params;
        const userId = req.user.id;

        const existing = await prisma.savedVerse.findUnique({
            where: {
                userId_verseId: { userId, verseId }
            }
        });

        if (existing) {
            return res.json({ success: true, message: 'Verse already saved' });
        }

        await prisma.savedVerse.create({
            data: { userId, verseId }
        });

        res.status(201).json({ success: true, message: 'Verse saved to profile' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save verse' });
    }
});

// Remove a saved verse
router.delete('/saved-verses/:verseId', verifyToken, async (req, res) => {
    try {
        const { verseId } = req.params;
        const userId = req.user.id;

        await prisma.savedVerse.delete({
            where: {
                userId_verseId: { userId, verseId }
            }
        });

        res.json({ success: true, message: 'Verse removed from profile' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to remove verse' });
    }
});

// Update user notification preferences
router.patch('/preferences', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { receiveNewsletter, receivePrayerAlerts } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                receiveNewsletter,
                receivePrayerAlerts
            }
        });

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: {
                receiveNewsletter: user.receiveNewsletter,
                receivePrayerAlerts: user.receivePrayerAlerts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update preferences' });
    }
});

// Update user profile (name, profileImage)
router.patch('/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, profileImage } = req.body;
        console.log(`[User] Updating profile for ${userId}: name=${name}, img=${profileImage?.substring(0, 50)}...`);

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                profileImage
            }
        });

        console.log(`[User] Profile updated successfully for ${userId}`);
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                role: user.role
            }
        });
    } catch (error) {
        console.error('[User] Profile update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

// --- ADMIN ROUTES ---

// Get all users
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        forumPosts: true,
                        blogPosts: true,
                        rsvps: true
                    }
                }
            }
        });

        const formattedUsers = users.map(user => ({
            ...user,
            _count: {
                comments: 0, // User model in schema doesn't have direct comments relation
                posts: (user._count.forumPosts || 0) + (user._count.blogPosts || 0),
                rsvps: user._count.rsvps || 0
            }
        }));

        res.json({ success: true, users: formattedUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update user role
router.patch('/admin/:id/role', verifyToken, requireAdmin, async (req, res) => {
    const { role } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role }
        });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete user
router.delete('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
