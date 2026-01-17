// Core dependencies
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Prisma client
import { prisma } from './lib/prisma.js';

// Routes
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import contactRoutes from './routes/contact.js';
import donationRoutes from './routes/donations.js';
import settingsRoutes from './routes/settings.js';
import bibleVerseRoutes from './routes/bible-verses.js';
import uploadRoutes from './routes/upload.js';
import { staticCors } from './middleware/staticCors.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📝 Logging middleware (only in dev)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 🔌 Database connection
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️  Server will continue without database connection');
    console.log('📝 To fix this:');
    console.log('   1. Ensure PostgreSQL is running locally');
    console.log('   2. Or use a cloud PostgreSQL service (Supabase, Railway, etc.)');
    console.log('   3. Check your .env DATABASE_URL');
    console.log('   4. Run: npm run db:push');
  }
}

connectDatabase();

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
app.use('/uploads', staticCors, express.static('uploads'));

// 📌 API routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/bible-verses', bibleVerseRoutes);
app.use('/api/upload', uploadRoutes);

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
