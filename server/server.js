const express = require('express');
const session = require("express-session");
const cors = require("cors");
const { passport } = require("./passport");
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const videoRoutes = require('./routes/videoRoutes');
const authRoutes = require("./routes/authRoutes");
const championDataRoutes = require("./routes/championDataRoutes");
require('dotenv').config();

const app = express();

app.options('*', cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
  credentials: true // Allow cookies to be sent
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Only allow this origin
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.json());

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
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true, // If needed
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
app.use("/api/auth", authRoutes);
app.use("/api/championData", championDataRoutes);



connectDB();

const PORT = process.env.PORT || 5174;

//Listens for all incoming http requests at the specified port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
