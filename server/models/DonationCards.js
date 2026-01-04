// models/DonationCard.js
const mongoose = require('mongoose');

const DonationCardSchema = new mongoose.Schema({
  name: String,
  imageURL: String,
  description: String,
  price: Number, // Optional: Set a target amount for the progress bar
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
});

module.exports = mongoose.model('DonationCard', DonationCardSchema);
