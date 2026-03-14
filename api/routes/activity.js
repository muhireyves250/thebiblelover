import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [users, donations, comments, prayers, topics] = await Promise.all([
      prisma.user.findMany({ 
        take: limit, 
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true }
      }),
      prisma.donation.findMany({ 
        take: limit, 
        orderBy: { createdAt: 'desc' },
        select: { id: true, donorName: true, amount: true, createdAt: true }
      }),
      prisma.comment.findMany({ 
        take: limit, 
        orderBy: { createdAt: 'desc' },
        include: { post: { select: { title: true } } }
      }),
      prisma.prayerRequest.findMany({ 
        take: limit, 
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } }
      }),
      prisma.forumTopic.findMany({ 
        take: limit, 
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } } }
      })
    ]);

    const activity = [
      ...users.map(u => ({
        id: `u-${u.id}`,
        type: 'SIGNUP',
        user: u.name || 'A Seeker',
        detail: 'Joined the sanctuary community',
        createdAt: u.createdAt
      })),
      ...donations.map(d => ({
        id: `d-${d.id}`,
        type: 'DONATION',
        user: d.donorName || 'Anonymous',
        detail: `Offered a seed of $${d.amount}`,
        createdAt: d.createdAt
      })),
      ...comments.map(c => ({
        id: `c-${c.id}`,
        type: 'COMMENT',
        user: c.authorName || 'Anonymous',
        detail: `Left an echo on "${c.post?.title || 'a reflection'}"`,
        createdAt: c.createdAt
      })),
      ...prayers.map(p => ({
        id: `p-${p.id}`,
        type: 'PRAYER',
        user: p.user?.name || 'A Believer',
        detail: `Shared a new intercession: ${p.title}`,
        createdAt: p.createdAt
      })),
      ...topics.map(t => ({
        id: `t-${t.id}`,
        type: 'FORUM',
        user: t.author?.name || 'Disciple',
        detail: `Initiated a discourse: ${t.title}`,
        createdAt: t.createdAt
      }))
    ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

    res.json({ success: true, activity });
  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity feed' });
  }
});

export default router;
