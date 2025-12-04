const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { passport } = require('./passport');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const videoRoutes = require('./routes/videoRoutes');
const authRoutes = require('./routes/authRoutes');
const championDataRoutes = require('./routes/championDataRoutes');
const donationRoutes = require('./routes/donationRoutes');
const webHookRoutes = require('./routes/webHookRoutes');
const skipMiddleware = require('./middleware/skipMiddleware');
const skinRoutes = require('./routes/skinRoutes');
const championStatsRoutes = require('./routes/championStatsRoutes');
const championCommentRoutes = require('./routes/championCommentRoutes');
const moderationRoutes = require('./routes/moderationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { startReconciler } = require('./utils/reconciler');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

const RAW_WEBHOOK_PATHS = [
  '/api/stripe/webhook',
  '/api/videos/webhook/mux',
];

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.options('*', cors({ origin: CLIENT_URL, credentials: true }));

app.use(cors({
  origin: CLIENT_URL, // Allow requests from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
  credentials: true, // Allow cookies to be sent
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CLIENT_URL); // Only allow this origin
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Keep Stripe webhook at /api/webhook raw body; also ensure Mux webhook at /api/videos/webhook/mux uses its own raw body
app.use(skipMiddleware(express.json(), RAW_WEBHOOK_PATHS));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //   maxAge: 60000 * 60 * 24,  // 1 day
    //   httpOnly: true,
    //   sameSite: "none",  // Required for cross-origin cookies
    //   secure: "false"  // Enable in production over HTTPS
    // }
  }),
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

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


// Use routes
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/championData', championDataRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/webhook', webHookRoutes);
app.use('/api/skins', skinRoutes);
app.use('/api/champions', championCommentRoutes);
app.use('/api/champions', championStatsRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/contact', contactRoutes);


connectDB().then(() => {
  try { startReconciler(); } catch (e) { console.warn('Reconciler failed to start:', e?.message); }
});

const PORT = process.env.PORT || 5174;

// Listens for all incoming http requests at the specified port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
