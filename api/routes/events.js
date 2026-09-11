import express from 'express';
const router = express.Router();
import { prisma } from '../lib/prisma.js';
import { verifyToken, requireAdmin, optionalAuth } from '../middleware/auth.js';

// Fold anonymous "Join this Event" taps (not individually tracked) into the
// same rsvp count the frontend already displays via _count.rsvps.
const withGuestRsvps = (event) => ({
    ...event,
    _count: { ...event._count, rsvps: event._count.rsvps + event.guestRsvps }
});

// GET all events
router.get('/', async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'asc' },
            include: {
                _count: {
                    select: { rsvps: true }
                }
            }
        });
        res.json({ success: true, data: events.map(withGuestRsvps) });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET single event
router.get('/:id', async (req, res) => {
    try {
        const event = await prisma.event.findUnique({
            where: { id: req.params.id },
            include: {
                author: {
                    select: { name: true, profileImage: true }
                },
                rsvps: {
                    select: { id: true, name: true, profileImage: true }
                },
                _count: {
                    select: { rsvps: true }
                }
            }
        });

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.json({ success: true, data: withGuestRsvps(event) });
    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST RSVP to event - works for signed-in users and guests alike. A
// signed-in RSVP is tracked per-account (toggleable, shows in "Who's
// Joining?"); a guest's tap isn't individually identifiable, so it just
// moves a shared counter based on the client's own locally-remembered
// state (the `joining` flag in the request body).
router.post('/:id/rsvp', optionalAuth, async (req, res) => {
    try {
        const eventId = req.params.id;

        if (!req.user) {
            const { joining } = req.body;
            let updated;
            if (joining) {
                updated = await prisma.event.update({
                    where: { id: eventId },
                    data: { guestRsvps: { increment: 1 } }
                });
            } else {
                const current = await prisma.event.findUnique({ where: { id: eventId } });
                updated = await prisma.event.update({
                    where: { id: eventId },
                    data: { guestRsvps: Math.max(0, (current?.guestRsvps || 0) - 1) }
                });
            }
            return res.json({
                success: true,
                message: joining ? 'RSVP successful' : 'RSVP removed',
                rsvpStatus: !!joining,
                guestRsvps: updated.guestRsvps
            });
        }

        const userId = req.user.id;

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { rsvps: { where: { id: userId } } }
        });

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        const isRSVPed = event.rsvps.length > 0;

        if (isRSVPed) {
            // Un-RSVP
            await prisma.event.update({
                where: { id: eventId },
                data: {
                    rsvps: {
                        disconnect: { id: userId }
                    }
                }
            });
            res.json({ success: true, message: 'RSVP removed', rsvpStatus: false });
        } else {
            // RSVP
            const updatedEvent = await prisma.event.update({
                where: { id: eventId },
                data: {
                    rsvps: {
                        connect: { id: userId }
                    }
                },
                include: {
                    author: { select: { id: true } }
                }
            });

            // Get user info for notification
            const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

            // Notify author if caller is not author
            if (updatedEvent.authorId !== userId) {
                await prisma.notification.create({
                    data: {
                        userId: updatedEvent.authorId,
                        type: 'EVENT_UPDATE',
                        title: 'New Event RSVP',
                        message: `${user.name} joined your event: "${updatedEvent.title}"`,
                        link: `/events/${eventId}`
                    }
                });
            }
            res.json({ success: true, message: 'RSVP successful', rsvpStatus: true });
        }
    } catch (error) {
        console.error('Error handling RSVP:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST create event (Admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { title, description, date, location, type, thumbnail } = req.body;

        const event = await prisma.event.create({
            data: {
                title,
                description,
                date: new Date(date),
                location,
                type,
                thumbnail,
                authorId: req.user.id
            }
        });

        res.status(201).json({ success: true, data: event });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT update event (Admin)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { title, description, date, location, type, thumbnail } = req.body;
        const updatedEvent = await prisma.event.update({
            where: { id: req.params.id },
            data: {
                title,
                description,
                date: date ? new Date(date) : undefined,
                location,
                type,
                thumbnail
            }
        });
        res.json({ success: true, data: updatedEvent });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE event (Admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        await prisma.event.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Event deleted' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
