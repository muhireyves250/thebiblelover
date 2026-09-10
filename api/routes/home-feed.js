import express from 'express';
import { prisma } from '../lib/prisma.js';
import { getLatestVideos, getLiveVideo } from '../lib/youtube.js';

const router = express.Router();

// Combined homepage feed: whichever is live on YouTube right now takes the
// featured slot; otherwise the most recent item (post or video) does. The
// rest of the recent items (posts + videos, mixed) fill out the grid.
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);

    const [posts, videos, live] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
        orderBy: { publishedAt: 'desc' },
        take: limit + 1,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          category: true,
          publishedAt: true,
          author: { select: { name: true, profileImage: true } }
        }
      }).catch(() => []),
      getLatestVideos(limit + 1).catch(() => []),
      getLiveVideo().catch(() => null)
    ]);

    const postItems = posts.map(p => ({
      type: 'POST',
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      thumbnail: p.featuredImage,
      category: p.category,
      publishedAt: p.publishedAt,
      author: p.author
    }));

    const combined = [...postItems, ...videos].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const featured = live || combined[0] || null;
    const items = combined.filter(item => !featured || item.id !== featured.id).slice(0, limit);

    res.json({
      success: true,
      data: { featured, items }
    });
  } catch (error) {
    console.error('Home feed error:', error);
    res.status(500).json({ success: false, message: 'Failed to load home feed' });
  }
});

export default router;
