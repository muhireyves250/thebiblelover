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

export default router;
