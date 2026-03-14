import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get user notifications
router.get('/', verifyToken, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId: req.user.id,
                isRead: false
            }
        });

        res.json({ success: true, data: { notifications, unreadCount } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark notification as read
router.patch('/:id/read', verifyToken, async (req, res) => {
    try {
        const notification = await prisma.notification.update({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            data: { isRead: true }
        });
        res.json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark all as read
router.patch('/read-all', verifyToken, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: {
                userId: req.user.id,
                isRead: false
            },
            data: { isRead: true }
        });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete notification
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await prisma.notification.delete({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
