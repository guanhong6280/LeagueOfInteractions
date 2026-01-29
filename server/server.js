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
const patchDiscussionRoutes = require('./routes/patchDiscussionRoutes');
const { startReconciler } = require('./utils/reconciler');

// FIX: Use 'require' instead of 'import' for Node.js
const { generalLimiter } = require('./middleware/rateLimiters');

// Initialize App
const app = express();

// =========================================================================
// 1. ENVIRONMENT & CONSTANTS
// =========================================================================
const PORT = process.env.PORT || 5174;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.set('trust proxy', 1); 
}

// =========================================================================
// 2. CORS CONFIGURATION
// =========================================================================
const allowedOrigins = [
  'http://localhost:5173',               
  'http://localhost:3000',               
  'https://leagueofinteractions.com',    
  'https://www.leagueofinteractions.com' ,
  "https://league-of-interactions-aml4e794t-guanhongs-projects.vercel.app"
];

if (process.env.CLIENT_URL) {
  const envUrl = process.env.CLIENT_URL.replace(/\/$/, ""); 
  if (!allowedOrigins.includes(envUrl)) {
    allowedOrigins.push(envUrl);
  }
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin); 
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// =========================================================================
// 2.5. HEALTH CHECK (Before other middleware for Render deployment)
// =========================================================================
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// =========================================================================
// 3. MIDDLEWARE & PARSING (CRITICAL ORDER)
// =========================================================================

// A. WEBHOOKS (First!)
// These need RAW bodies. We mount them BEFORE express.json()
// They handle their own parsing inside webHookRoutes.js
app.use('/api/webhook', webHookRoutes);

// B. GLOBAL BODY PARSER (Second)
// Now safe to use globally because webhooks are already handled
app.use(express.json());

// C. RATE LIMITING (Global)
app.use('/api/', generalLimiter);

// D. SESSION
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true, 
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, 
      secure: isProduction, 
      sameSite: isProduction ? 'none' : 'lax',
      httpOnly: true, 
    }
  }),
);

// E. PASSPORT
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
// Note: /api/webhook is already mounted above!

app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/auth', authRoutes); // Strict limiter for Auth
app.use('/api/championData', championDataRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/skins', skinRatingRoutes);
app.use('/api/champions', championRatingRoutes);
app.use('/api/champion-stats', championStatsRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/patch-discussion', patchDiscussionRoutes);

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