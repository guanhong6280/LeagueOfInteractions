const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Donation = require('../../models/Donations');
const DonationCard = require('../../models/DonationCards');
const mongoose = require('mongoose');
const { Resend } = require('resend');
require('dotenv').config();
const resend = new Resend(process.env.RESEND_API_KEY);

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
          status: 'completed', // Only count completed donations, not refunded or disputed
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
    const totalAmountUSD = totalAmount / 100;

    res.json({ totalDonations: totalAmountUSD });
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

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;

  try {
    // Verify Stripe Signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle "Checkout Completed"
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Extract Data
    const customerName = session.customer_details?.name; // Will use schema default 'Anonymous' if undefined
    const customerEmail = session.customer_details?.email;
    const amountCents = session.amount_total; 
    const donationCardId = session.metadata.donation_card_id;
    const currency = session.currency?.toUpperCase() || 'USD'; // Extract from session, default to USD

    console.log(`🎉 Donation received: $${(amountCents / 100).toFixed(2)} from ${customerName || 'Anonymous'}`);

    try {
      // Save to MongoDB
      // Note: createdAt/updatedAt are automatically handled by timestamps: true in schema
      // Status defaults to 'completed' in schema, which is correct for successful checkout
      await Donation.create({
        donationCardId: new mongoose.Types.ObjectId(donationCardId),
        amount: amountCents,
        currency: currency,
        donorEmail: customerEmail,
        donorName: customerName, // Will use schema default 'Anonymous' if undefined
        stripeSessionId: session.id,
      });
      console.log('✅ Donation saved to DB.');
    } catch (error) {
      console.error('❌ Error saving donation to DB:', error);
      // Do not return error to Stripe to avoid infinite retries on DB failure
    }

    // Send "Thank You" Email
    if (customerEmail) {
      const formattedAmount = (amountCents / 100).toFixed(2);
      // Call the internal helper function
      await sendThankYouEmail(customerEmail, customerName, formattedAmount);
    }
  }

  // Handle "Charge Refunded" - Update donation status to 'refunded'
  if (event.type === 'charge.refunded') {
    const charge = event.data.object;

    try {
      // Retrieve the checkout session from the charge's payment intent
      let sessionId = null;
      if (charge.payment_intent) {
        const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent);
        // Get the checkout session ID from the payment intent metadata or list sessions
        if (paymentIntent.metadata?.checkout_session_id) {
          sessionId = paymentIntent.metadata.checkout_session_id;
        } else {
          // List checkout sessions for this payment intent
          const sessions = await stripe.checkout.sessions.list({
            payment_intent: charge.payment_intent,
            limit: 1,
          });
          if (sessions.data.length > 0) {
            sessionId = sessions.data[0].id;
          }
        }
      }

      if (sessionId) {
        const donation = await Donation.findOne({ stripeSessionId: sessionId });
        if (donation) {
          donation.status = 'refunded';
          await donation.save();
          console.log(`🔄 Donation ${donation._id} marked as refunded`);
        } else {
          console.warn(`⚠️  Donation not found for refunded session: ${sessionId}`);
        }
      } else {
        console.warn(`⚠️  Could not find session for refunded charge: ${charge.id}`);
      }
    } catch (error) {
      console.error('❌ Error updating donation status to refunded:', error);
    }
  }

  // Handle "Dispute Created" - Update donation status to 'disputed'
  if (event.type === 'charge.dispute.created') {
    const dispute = event.data.object;
    const chargeId = dispute.charge;

    try {
      // Retrieve the charge to get the payment intent
      const charge = await stripe.charges.retrieve(chargeId);
      let sessionId = null;

      if (charge.payment_intent) {
        const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent);
        if (paymentIntent.metadata?.checkout_session_id) {
          sessionId = paymentIntent.metadata.checkout_session_id;
        } else {
          // List checkout sessions for this payment intent
          const sessions = await stripe.checkout.sessions.list({
            payment_intent: charge.payment_intent,
            limit: 1,
          });
          if (sessions.data.length > 0) {
            sessionId = sessions.data[0].id;
          }
        }
      }

      if (sessionId) {
        const donation = await Donation.findOne({ stripeSessionId: sessionId });
        if (donation) {
          donation.status = 'disputed';
          await donation.save();
          console.log(`⚠️  Donation ${donation._id} marked as disputed`);
        } else {
          console.warn(`⚠️  Donation not found for disputed session: ${sessionId}`);
        }
      } else {
        console.warn(`⚠️  Could not find session for disputed charge: ${chargeId}`);
      }
    } catch (error) {
      console.error('❌ Error updating donation status to disputed:', error);
    }
  }

  // Acknowledge receipt to Stripe
  res.json({ received: true });
};

// --- 3. NEW: INTERNAL HELPER (Not exported) ---

const sendThankYouEmail = async (email, name, amount) => {
  try {
    const data = await resend.emails.send({
      from: 'LeagueInteractions <onboarding@resend.dev>', // Update this for Production!
      to: [email],
      subject: 'Thank You for Your Donation! 💖',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #000; text-transform: uppercase;">Thank You, ${name}!</h2>
          <p>We successfully received your donation of <strong>$${amount}</strong>.</p>
          <p>Your support helps us keep the servers running.</p>
        </div>
      `,
    });

    if (data.error) console.error('❌ Resend API Error:', data.error);
    else console.log(`📧 Email sent to ${email}`);

  } catch (error) {
    console.error('❌ Error sending email via Resend:', error.message);
  }
};