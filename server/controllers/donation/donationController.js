const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Donation = require('../../models/Donations');
const DonationCard = require('../../models/DonationCards');
const mongoose = require('mongoose');
require('dotenv').config();

exports.createStripeSession = async (req, res) => {
  const { amount, donationCardId } = req.body; // Amount in cents

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'donation',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      payment_method_types: ['card'],
      mode: 'payment',
      billing_address_collection: 'required',
      customer_creation: 'always',
      success_url: `${process.env.CLIENT_URL}/donation?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/donation?canceled=true`,
      metadata: {
        donation_card_id: donationCardId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getDonationProgress = async (req, res) => {
  const { donationCardId } = req.params;

  // Validate donationCardId
  if (!mongoose.isValidObjectId(donationCardId)) {
    return res.status(400).json({ error: 'Invalid donationCardId' });
  }

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  try {
    const totalDonations = await Donation.aggregate([
      {
        $match: {
          donationCardId: new mongoose.Types.ObjectId(donationCardId),
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const totalAmount = totalDonations.length > 0 ? totalDonations[0].totalAmount : 0;

    res.json({ totalDonations: totalAmount });
  } catch (error) {
    console.error('Error fetching total donations:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getDonationCards = async (req, res) => {
  try {
    const donationCards = await DonationCard.find({});
    res.json(donationCards);
  } catch (error) {
    console.error('Error fetching donation cards:', error);
    res.status(500).send('Internal Server Error');
  }
};
