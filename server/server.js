const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { passport } = require('./passport');
const mongoose = require('mongoose');
require('dotenv').config();

// Route Imports
const userRoutes = require('./routes/userRoutes');
const videoRoutes = require('./routes/videoRoutes');
const authRoutes = require('./routes/authRoutes');
const championDataRoutes = require('./routes/championDataRoutes');
const donationRoutes = require('./routes/donationRoutes');
const webHookRoutes = require('./routes/webHookRoutes');
const skinRatingRoutes = require('./routes/skinRatingRoutes');
const championStatsRoutes = require('./routes/championStatsRoutes');
const championRatingRoutes = require('./routes/championRatingRoutes');
const moderationRoutes = require('./routes/moderationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const skipMiddleware = require('./middleware/skipMiddleware');
const { startReconciler } = require('./utils/reconciler');

import { generalLimiter, authLimiter } from './middleware/rateLimiters';

// Initialize App
const app = express();

// =========================================================================
// 1. ENVIRONMENT & CONSTANTS
// =========================================================================
const PORT = process.env.PORT || 5174;
const isProduction = process.env.NODE_ENV === 'production';

// CRITICAL: Tells Express to trust the proxy (Render/Vercel load balancers)
// Without this, 'secure' cookies will not work.
if (isProduction) {
  app.set('trust proxy', 1); 
}

// =========================================================================
// 2. CORS CONFIGURATION (The logic you asked for)
// =========================================================================
const allowedOrigins = [
  'http://localhost:5173',               // Vite Local Dev
  'http://localhost:3000',               // CRA/Next Local Dev
  'https://leagueofinteractions.com',    // Your Production Domain
  'https://www.leagueofinteractions.com' // WWW Version
];

// If you have a CLIENT_URL in .env, add it to the list safely
if (process.env.CLIENT_URL) {
  const envUrl = process.env.CLIENT_URL.replace(/\/$/, ""); // Remove trailing slash
  if (!allowedOrigins.includes(envUrl)) {
    allowedOrigins.push(envUrl);
  }
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin); // Helpful for debugging
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow Cookies/Sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Apply CORS globally
app.use(cors(corsOptions));
// Handle pre-flight requests explicitly (optional but recommended)
app.options('*', cors(corsOptions));

// =========================================================================
// 3. MIDDLEWARE
// =========================================================================

// Webhook handling: Skip JSON parsing for specific routes that need raw bodies
const RAW_WEBHOOK_PATHS = [
  '/api/stripe/webhook',
  '/api/videos/webhook/mux',
];
app.use(skipMiddleware(express.json(), RAW_WEBHOOK_PATHS));

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true, // Required for Render/Heroku to handle cookies correctly
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 Day
      // Secure: true in production (HTTPS), false in dev (HTTP)
      secure: isProduction, 
      // SameSite: 'none' is required for cross-site cookies (Backend on Render, Frontend on Vercel)
      sameSite: isProduction ? 'none' : 'lax',
      httpOnly: true, 
    }
  }),
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// =========================================================================
// 4. DATABASE
// =========================================================================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'leagueOfInteractions',
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// =========================================================================
// 5. ROUTES
// =========================================================================
app.use('/api/', generalLimiter);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/championData', championDataRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/webhook', webHookRoutes);
app.use('/api/skins', skinRatingRoutes);
app.use('/api/champions', championRatingRoutes);
app.use('/api/champion-stats', championStatsRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/contact', contactRoutes);

// =========================================================================
// 6. START SERVER
// =========================================================================
connectDB().then(() => {
  try { startReconciler(); } catch (e) { console.warn('Reconciler failed to start:', e?.message); }
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Allowed Origins:`, allowedOrigins);
  });
});