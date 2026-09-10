import express from 'express';
import { prisma } from '../lib/prisma.js';
import { getLatestVideos, getLiveVideo } from '../lib/youtube.js';

const router = express.Router();

// The "Watch" slot is always YouTube content — a live broadcast if one's
// running right now, otherwise the most recent upload. It never falls back
// to a blog post; that would put written content in a spot labeled for
// video. "Latest Reflections" is blog posts only, kept separate.
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);

    const [posts, videos, live] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          category: true,
          publishedAt: true,
          views: true,
          likes: true,
          author: { select: { name: true, profileImage: true } },
          _count: { select: { comments: true } }
        }
      }).catch(() => []),
      getLatestVideos(1).catch(() => []),
      getLiveVideo().catch(() => null)
    ]);

    const items = posts.map(p => ({
      type: 'POST',
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      thumbnail: p.featuredImage,
      category: p.category,
      publishedAt: p.publishedAt,
      author: p.author,
      views: p.views,
      likes: p.likes,
      comments: p._count.comments
    }));

    const featured = live || videos[0] || null;

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
