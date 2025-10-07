import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { validateBlogPost } from '../middleware/validation.js';

const router = express.Router();

// Get all published blog posts (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const tag = req.query.tag;
    const search = req.query.search;

    // Build where clause
    const where = { status: 'PUBLISHED' };
    
    if (category) {
      where.category = category.toUpperCase();
    }
    
    if (tag) {
      where.tags = { has: tag.toLowerCase() };
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * limit;

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            profileImage: true
          }
        },
        _count: { select: { comments: true } }
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.blogPost.count({ where });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: error.message
    });
  }
});

// Get single blog post by slug (public)
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { 
        slug: req.params.slug,
        status: 'PUBLISHED'
      },
      include: {
        author: {
          select: {
            name: true,
            profileImage: true
          }
        },
        _count: { select: { comments: true } }
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment view count, and reflect the increment in the response
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    });

    const incremented = { ...post, views: (post.views || 0) + 1 };

    res.json({
      success: true,
      data: { post: incremented }
    });
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post',
      error: error.message
    });
  }
});

// Create new blog post (admin only)
router.post('/', verifyToken, requireAdmin, validateBlogPost, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      authorId: req.user.id,
      status: req.body.status || 'DRAFT'
    };

    // Set published date if status is published
    if (postData.status === 'PUBLISHED') {
      postData.publishedAt = new Date();
    }

    const post = await prisma.blogPost.create({
      data: postData,
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog post',
      error: error.message
    });
  }
});

// Update blog post (admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If publishing, set publishedAt when moving to PUBLISHED
    if (updateData.status === 'PUBLISHED' && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { name: true, email: true } }
      }
    });

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog post',
      error: error.message
    });
  }
});

// Delete blog post (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.blogPost.delete({ where: { id } });
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog post',
      error: error.message
    });
  }
});

// Get all blog posts (admin only)
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const category = req.query.category;

    const where = {};
    if (status) where.status = status.toUpperCase();
    if (category) where.category = category.toUpperCase();

    const skip = (page - 1) * limit;

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.blogPost.count({ where });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all blog posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: error.message
    });
  }
});

// Admin: list all comments (optional filters)
router.get('/admin/comments', verifyToken, requireAdmin, async (req, res) => {
  try {
    const status = req.query.status; // approved|pending
    const where = {};
    if (status === 'approved') where.isApproved = true;
    if (status === 'pending') where.isApproved = false;
    const comments = await prisma.comment.findMany({
      where,
      select: {
        id: true,
        content: true,
        authorName: true,
        authorEmail: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: { comments } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});

// Get single blog post by id (admin only)
router.get('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true, profileImage: true } },
      },
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    res.json({ success: true, data: { post } });
  } catch (error) {
    console.error('Get admin blog post error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blog post', error: error.message });
  }
});

// Like a blog post (public)
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if post exists
    const post = await prisma.blogPost.findUnique({
      where: { id }
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    // Increment likes
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: { likes: { increment: 1 } }
    });
    
    res.json({
      success: true,
      message: 'Post liked successfully',
      data: { likes: updatedPost.likes }
    });
  } catch (error) {
    console.error('Like blog post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post',
      error: error.message
    });
  }
});

// Unlike a blog post (public)
router.post('/:id/unlike', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if post exists
    const post = await prisma.blogPost.findUnique({
      where: { id }
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    // Decrement likes (but don't go below 0)
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: { likes: { decrement: 1 } }
    });
    
    res.json({
      success: true,
      message: 'Post unliked successfully',
      data: { likes: Math.max(0, updatedPost.likes) }
    });
  } catch (error) {
    console.error('Unlike blog post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlike post',
      error: error.message
    });
  }
});

// Public: list approved comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await prisma.comment.findMany({
      where: { postId: id, isApproved: true },
      select: {
        id: true,
        content: true,
        authorName: true,
        authorEmail: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: { comments } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load comments' });
  }
});

// Public: create a comment (awaiting approval)
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { authorName, authorEmail, content } = req.body;
    if (!content || !authorName || !authorEmail) {
      return res.status(400).json({ success: false, message: 'authorName, authorEmail and content are required' });
    }
    // ensure post exists
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const comment = await prisma.comment.create({
      data: { content, authorName, authorEmail, postId: id, isApproved: true }
    });
    res.status(201).json({ success: true, message: 'Comment posted', data: { comment } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit comment' });
  }
});

// Admin: list all comments for a post
router.get('/admin/:id/comments', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await prisma.comment.findMany({
      where: { postId: id },
      select: {
        id: true,
        content: true,
        authorName: true,
        authorEmail: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: { comments } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});

// Admin: approve comment
router.put('/admin/comments/:commentId/approve', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { commentId } = req.params;
    const updated = await prisma.comment.update({ where: { id: commentId }, data: { isApproved: true } });
    res.json({ success: true, message: 'Comment approved', data: { comment: updated } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve comment' });
  }
});

// Admin: delete comment
router.delete('/admin/comments/:commentId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { commentId } = req.params;
    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
});

export default router;