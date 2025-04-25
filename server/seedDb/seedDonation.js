// seedDonationCards.js
const mongoose = require('mongoose');
const DonationCard = require("../models/DonationCards");
require('dotenv').config();

// Replace with your actual MongoDB connection string
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('MongoDB connected');

  const donationCards = [
    {
      name: "Coursera",
      imageURL: "https://www.langoly.com/wp-content/uploads/2021/09/coursera-logo.png",
      description: "I want to become a better frontend developer by obtaining the frontend developer certificate from meta",
      price: 20,
    },
    {
      name: "Leetcode",
      imageURL: "https://assets.leetcode.com/static_assets/public/images/LeetCode_logo_rvs.png",
      description: "I use leetcode to strengthen my knowledge in data structures and algorithms.",
      price: 10,
    },
    {
      name: "FrontendMasters",
      imageURL: "https://static.frontendmasters.com/assets/fm/js/images/frontendmasters_3bcb5619.svg",
      description: "I use frontendmasters to hone my skill in frontend development",
      price: 39,
    },
  ];

  try {
    // Optional: Clear existing donation cards to avoid duplicates
    await DonationCard.deleteMany({});
    await DonationCard.insertMany(donationCards);
    console.log('Donation cards inserted');
    mongoose.disconnect();
  } catch (err) {
    console.error('Error inserting donation cards:', err);
    mongoose.disconnect();
  }
}).catch(err => {
  console.error('MongoDB connection error:', err);
});