// models/Donation.js
const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donationCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'DonationCard' },
  amount: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Donation', DonationSchema);