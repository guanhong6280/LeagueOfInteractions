const express = require('express');
const session = require("express-session");
const passport = require("passport");
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const videoRoutes = require('./routes/videoRoutes');
const authRoutes = require("./routes/authRoutes");
require('dotenv').config();

const app = express();

// Middleware for parsing JSON bodies
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true, // If needed
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process with failure
  }
};


// Use routes
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use("/api/auth", authRoutes);


connectDB();

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
