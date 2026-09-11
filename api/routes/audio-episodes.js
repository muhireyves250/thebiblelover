import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { validateAudioEpisode, validateAudioEpisodeUpdate, validateAudioComment } from '../middleware/validation.js';

const router = express.Router();

// Admin: list all episodes (published + unpublished), optional slot filter
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { slot } = req.query;
    const where = {};
    if (slot === 'MORNING' || slot === 'EVENING') where.slot = slot;

    const episodes = await prisma.audioEpisode.findMany({
      where,
      orderBy: { episodeDate: 'desc' },
      include: { _count: { select: { comments: true } } }
    });

    res.json({
      success: true,
      data: {
        episodes: episodes.map(e => ({ ...e, commentsCount: e._count.comments, _count: undefined }))
      }
    });
  } catch (error) {
    console.error('List audio episodes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch episodes' });
  }
});

// Admin: create episode
router.post('/', verifyToken, requireAdmin, validateAudioEpisode, async (req, res) => {
  try {
    const { title, description, audioUrl, coverImage, slot, episodeDate, isPublished } = req.body;

    const episode = await prisma.audioEpisode.create({
      data: {
        title,
        description,
        audioUrl,
        coverImage,
        slot,
        // Posting an episode with no explicit date makes it "today's" —
        // same fix already applied to bible-verses.js's create route, for
        // the same reason: a null date can never sort to the top or match
        // a day filter.
        episodeDate: episodeDate ? new Date(episodeDate) : new Date(),
        isPublished: isPublished ?? true,
        authorId: req.user.id
      }
    });

    res.status(201).json({ success: true, message: 'Audio episode created successfully', data: { episode } });
  } catch (error) {
    console.error('Create audio episode error:', error);
    res.status(500).json({ success: false, message: 'Failed to create episode' });
  }
});

// Admin: update episode
router.put('/:id', verifyToken, requireAdmin, validateAudioEpisodeUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.episodeDate) {
      updateData.episodeDate = new Date(updateData.episodeDate);
    }

    const episode = await prisma.audioEpisode.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, message: 'Audio episode updated successfully', data: { episode } });
  } catch (error) {
    console.error('Update audio episode error:', error);
    res.status(500).json({ success: false, message: 'Failed to update episode' });
  }
});

// Admin: delete episode
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.audioEpisode.delete({ where: { id } });
    res.json({ success: true, message: 'Audio episode deleted successfully' });
  } catch (error) {
    console.error('Delete audio episode error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete episode' });
  }
});

// Public: list published episodes, optional slot filter, paginated
router.get('/', async (req, res) => {
  try {
    const { slot } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const where = { isPublished: true };
    if (slot === 'MORNING' || slot === 'EVENING') where.slot = slot;

    const [episodes, total] = await Promise.all([
      prisma.audioEpisode.findMany({
        where,
        orderBy: { episodeDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.audioEpisode.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        episodes,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    console.error('List audio episodes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch episodes' });
  }
});

// Public: get one episode
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const episode = await prisma.audioEpisode.findFirst({ where: { id, isPublished: true } });
    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }
    res.json({ success: true, data: { episode } });
  } catch (error) {
    console.error('Get audio episode error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch episode' });
  }
});

// Public: like an episode (anonymous or authenticated — plain counter, no dedup)
router.post('/:id/like', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const episode = await prisma.audioEpisode.update({
      where: { id },
      data: { likes: { increment: 1 } }
    });
    res.json({ success: true, message: 'Episode liked', data: { likes: episode.likes } });
  } catch (error) {
    console.error('Like audio episode error:', error);
    res.status(500).json({ success: false, message: 'Failed to like episode' });
  }
});

// Public: unlike an episode
router.post('/:id/unlike', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const episode = await prisma.audioEpisode.update({
      where: { id },
      data: { likes: { decrement: 1 } }
    });
    res.json({ success: true, message: 'Episode unliked', data: { likes: Math.max(0, episode.likes) } });
  } catch (error) {
    console.error('Unlike audio episode error:', error);
    res.status(500).json({ success: false, message: 'Failed to unlike episode' });
  }
});

// Admin: list all comments (optional status filter), or comments for one episode
router.get('/admin/comments', verifyToken, requireAdmin, async (req, res) => {
  try {
    const status = req.query.status; // 'approved' | 'pending'
    const where = {};
    if (status === 'approved') where.isApproved = true;
    if (status === 'pending') where.isApproved = false;

    const comments = await prisma.audioComment.findMany({
      where,
      include: { episode: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: { comments } });
  } catch (error) {
    console.error('Admin list audio comments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});

// Admin: list comments for one episode (all, regardless of approval)
router.get('/admin/:id/comments', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await prisma.audioComment.findMany({
      where: { episodeId: id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: { comments } });
  } catch (error) {
    console.error('Admin list episode comments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});

// Admin: approve a comment
router.put('/admin/comments/:commentId/approve', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await prisma.audioComment.update({
      where: { id: commentId },
      data: { isApproved: true }
    });
    res.json({ success: true, message: 'Comment approved', data: { comment } });
  } catch (error) {
    console.error('Approve audio comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve comment' });
  }
});

// Admin: delete a comment
router.delete('/admin/comments/:commentId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { commentId } = req.params;
    await prisma.audioComment.delete({ where: { id: commentId } });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete audio comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
});

// Public: list approved comments for an episode
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await prisma.audioComment.findMany({
      where: { episodeId: id, isApproved: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: { comments } });
  } catch (error) {
    console.error('List audio comments error:', error);
    res.status(500).json({ success: false, message: 'Failed to load comments' });
  }
});

// Public: submit a comment — held for moderation (isApproved: false)
router.post('/:id/comments', validateAudioComment, async (req, res) => {
  try {
    const { id } = req.params;
    const { authorName, authorEmail, content } = req.body;

    const episode = await prisma.audioEpisode.findUnique({ where: { id } });
    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    const comment = await prisma.audioComment.create({
      data: { content, authorName, authorEmail, episodeId: id, isApproved: false }
    });

    res.status(201).json({
      success: true,
      message: 'Comment submitted and awaiting approval',
      data: { comment }
    });
  } catch (error) {
    console.error('Create audio comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit comment' });
  }
});

export default router;
