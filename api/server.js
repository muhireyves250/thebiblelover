// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Core dependencies
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Prisma client
import { prisma } from './lib/prisma.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import contactRoutes from './routes/contact.js';
import donationRoutes from './routes/donations.js';
import settingsRoutes from './routes/settings.js';
import bibleVerseRoutes from './routes/bible-verses.js';
import uploadRoutes from './routes/upload.js';
import newsletterRoutes from './routes/newsletter.js';
import userRoutes from './routes/user.js';
import prayerRequestRoutes from './routes/prayer-requests.js';
import forumRoutes from './routes/forum.js';
import devotionalsRoutes from './routes/devotionals.js';
import eventRoutes from './routes/events.js';
import notificationRoutes from './routes/notifications.js';
import searchRouter from './routes/search.js';
import activityRoutes from './routes/activity.js';
import statsRouter from './routes/stats.js';
import { staticCors } from './middleware/staticCors.js';
import { initCronJobs } from './lib/cronWorker.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// 🔒 Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:5000"],
    },
  },
}));
app.use(compression());

// 🌍 CORS configuration
app.use(cors({
  origin: '*', // Accept all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-bible-verse-image'],
  optionsSuccessStatus: 200
}));

// 📊 Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for dev/reloads
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// 📦 Body parsing middleware
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    if (req.originalUrl.startsWith('/api/donations/webhook')) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📝 Logging middleware (only in dev)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 🔌 Database connection
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️  Server will continue without database connection');
  }
}

connectDatabase();

// 🕊️ Start Spiritual Autonomy Workers
initCronJobs();

// 🏠 Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bible Project API is live! 🙏',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      blog: '/api/blog',
      contact: '/api/contact',
      donations: '/api/donations',
      settings: '/api/settings',
      bibleVerses: '/api/bible-verses',
      upload: '/api/upload',
      newsletter: '/api/newsletter'
    }
  });
});

// 🩺 Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Bible Project API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 📁 Static files for uploads with CORS headers
app.use('/uploads', staticCors, express.static(path.join(__dirname, 'uploads')));

// 📌 API routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/bible-verses', bibleVerseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/user', userRoutes);
app.use('/api/prayer-requests', prayerRequestRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/devotionals', devotionalsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRouter);
app.use('/api/stats', statsRouter);
app.use('/api/activity', activityRoutes);

// ❌ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// ⚠️ Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 🛑 Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 Bible Project API ready at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

export default app;
