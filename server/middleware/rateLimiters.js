const rateLimit = require('express-rate-limit');

// 1. GENERAL TRAFFIC LIMITER
// Purpose: Prevent DDoS and excessive scraping
// Rule: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    error: 'Too many requests, please try again later.',
  },
  // CRITICAL: Render/Vercel put you behind a proxy. 
  // We trust the proxy settings defined in server.js, so no extra config needed here.
});

// 2. STRICT AUTH LIMITER
// Purpose: Prevent Brute Force Login & Spam Signups
// Rule: 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Strict limit!
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many login/signup attempts. Please wait 15 minutes.',
  },
});

// 3. UPLOAD LIMITER (Optional but Smart)
// Purpose: Prevent someone from filling your Mux/Database quota
// Rule: 3 uploads per hour
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, 
  message: {
    status: 429,
    error: 'Upload limit exceeded. You can only upload 3 videos per hour.',
  },
});

// 4. DONATION LIMITER
// Purpose: Prevent spam donation sessions and abuse
// Rule: 5 donation sessions per 15 minutes per IP
const donationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 donation sessions per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many donation attempts. Please wait a moment.',
  },
});

module.exports = { generalLimiter, authLimiter, uploadLimiter, donationLimiter };