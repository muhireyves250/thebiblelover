import cors from 'cors';

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL
].filter(Boolean);

// CORS middleware specifically for serving static files
export const staticCors = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, always allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject origin
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: false, // Set to false when using wildcard origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-bible-verse-image'],
  optionsSuccessStatus: 200,
  preflightContinue: false
});

export default staticCors;