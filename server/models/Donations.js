const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donationCardId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DonationCard',
    required: true 
  },
  
  // Financials
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'usd',
    uppercase: true
  },

  // Donor Information
  donorName: { 
    type: String, 
    default: 'Anonymous' 
  },
  donorEmail: { 
    type: String,
    trim: true,
    lowercase: true
  },

  // Technical / Audit
  stripeSessionId: { 
    type: String, 
    required: true,
    unique: true 
  },
  status: {
    type: String,
    enum: ['completed', 'refunded', 'disputed'],
    default: 'completed'
  }
}, {
  timestamps: true // <--- This automatically creates 'createdAt' and 'updatedAt'
});

DonationSchema.index({ donationCardId: 1, createdAt: -1 });

module.exports = mongoose.model('Donation', DonationSchema);