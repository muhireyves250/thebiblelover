import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { validateUserLogin, validateUserRegistration } from '../middleware/validation.js';

const router = express.Router();

// Health
router.get('/health', (_req, res) => {
  res.json({ success: true, route: 'auth', status: 'OK' });
});

// Register
router.post('/register', validateUserRegistration, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: 'USER' },
      select: { id: true, name: true, email: true, role: true, isActive: true, lastLogin: true, profileImage: true, createdAt: true, updatedAt: true }
    });
    const token = generateToken(user.id);
    res.status(201).json({ success: true, message: 'Registration successful', data: { user, token } });
  } catch (err) { next(err); }
});

// Login
router.post('/login', validateUserLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const found = await prisma.user.findUnique({ where: { email } });
    if (!found) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, found.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    await prisma.user.update({ where: { id: found.id }, data: { lastLogin: new Date() } });
    const user = { id: found.id, name: found.name, email: found.email, role: found.role, isActive: found.isActive, lastLogin: found.lastLogin, profileImage: found.profileImage, createdAt: found.createdAt, updatedAt: found.updatedAt };
    const token = generateToken(found.id);
    res.json({ success: true, message: 'Login successful', data: { user, token } });
  } catch (err) { next(err); }
});

// Me
router.get('/me', verifyToken, (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

// Update profile
router.put('/profile', verifyToken, async (req, res, next) => {
  try {
    const { name, profileImage } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { ...(name ? { name } : {}), ...(profileImage ? { profileImage } : {}) },
      select: { id: true, name: true, email: true, role: true, isActive: true, lastLogin: true, profileImage: true, createdAt: true, updatedAt: true }
    });
    res.json({ success: true, message: 'Profile updated', data: { user: updated } });
  } catch (err) { next(err); }
});

// Change password
router.put('/change-password', verifyToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    const found = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!found) return res.status(404).json({ success: false, message: 'User not found' });
    const ok = await bcrypt.compare(currentPassword, found.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: found.id }, data: { password: hashed } });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
});

// Logout (stateless)
router.post('/logout', verifyToken, (_req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

// Forgot Password (Mock implementation for now)
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success to prevent email enumeration
    console.log(`[AUTH] Password reset requested for: ${email}`);
    if (user) {
      // In a real app, send email with token
      console.log(`[AUTH] Reset token would be sent to: ${email}`);
    }
    
    res.json({ 
      success: true, 
      message: 'If an account exists with that email, a reset link has been sent.' 
    });
  } catch (err) { next(err); }
});

// Reset Password (Mock implementation)
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password required' });
    
    // Mock success for the "polish" demonstration
    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) { next(err); }
});

export default router;


