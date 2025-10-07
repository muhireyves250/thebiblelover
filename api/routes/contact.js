import express from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { validateContact } from '../middleware/validation.js';

const router = express.Router();

// Submit contact form (public)
router.post('/', validateContact, async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    const contact = await prisma.contact.create({
      data: contactData
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
      data: {
        contact: {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          status: contact.status,
          createdAt: contact.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message
    });
  }
});

// Get all contact messages (admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const where = {};
    if (status) where.status = status.toUpperCase();

    const skip = (page - 1) * limit;

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.contact.count({ where });

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalContacts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages',
      error: error.message
    });
  }
});

// Get single contact message (admin only)
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id }
    });
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Mark as read if not already read
    if (!contact.isRead) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { 
          isRead: true,
          status: 'READ'
        }
      });
    }

    res.json({
      success: true,
      data: { contact }
    });
  } catch (error) {
    console.error('Get contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact message',
      error: error.message
    });
  }
});

// Update contact message status (admin only)
router.put('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status, replyMessage } = req.body;

    if (!['NEW', 'READ', 'REPLIED', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updateData = { status };
    
    if (status === 'REPLIED' && replyMessage) {
      updateData.replyMessage = replyMessage;
      updateData.repliedAt = new Date();
    }

    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Contact message status updated successfully',
      data: { contact }
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact message status',
      error: error.message
    });
  }
});

// Mark contact message as read (admin only)
router.put('/:id/read', verifyToken, requireAdmin, async (req, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    const updatedContact = await prisma.contact.update({
      where: { id: req.params.id },
      data: { 
        isRead: true,
        status: contact.status === 'NEW' ? 'READ' : contact.status
      }
    });

    res.json({
      success: true,
      message: 'Contact message marked as read',
      data: { contact: updatedContact }
    });
  } catch (error) {
    console.error('Mark contact as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark contact message as read',
      error: error.message
    });
  }
});

// Delete contact message (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    await prisma.contact.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Contact message deleted successfully',
      data: { 
        deletedContact: {
          id: contact.id,
          name: contact.name,
          subject: contact.subject,
          email: contact.email
        }
      }
    });
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message',
      error: error.message
    });
  }
});

export default router;