const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Donation = require('../../models/Donations');
const DonationCard = require('../../models/DonationCards');
const mongoose = require('mongoose');
const { Resend } = require('resend');
require('dotenv').config();
const resend = new Resend(process.env.RESEND_API_KEY);

exports.createStripeSession = async (req, res) => {
  const { amount, donationCardId } = req.body; // Amount in cents

  // ========== VALIDATION ==========
  
  // 1. Validate amount
  const MIN_AMOUNT = 200;   // $2.00 minimum (in cents) - avoids confusion with very small amounts
  const MAX_AMOUNT = 100000; // $1,000 maximum (in cents)
  
  const amountInt = Number.parseInt(amount, 10);
  
  if (!Number.isInteger(amountInt) || amountInt < MIN_AMOUNT || amountInt > MAX_AMOUNT) {
    console.log(`[SECURITY] Invalid donation amount attempted: ${amount} from IP ${req.ip}`);
    return res.status(400).json({ 
      error: `Donation amount must be between $${MIN_AMOUNT / 100} and $${MAX_AMOUNT / 100}.` 
    });
  }

  // 2. Validate donationCardId
  if (!mongoose.isValidObjectId(donationCardId)) {
    console.log(`[SECURITY] Invalid donationCardId attempted: ${donationCardId} from IP ${req.ip}`);
    return res.status(400).json({ error: 'Invalid donation card ID.' });
  }

  // 3. Verify donation card exists and is active (wrapped in try/catch for DB errors)
  let donationCard;
  try {
    donationCard = await DonationCard.findById(donationCardId).lean();
    if (!donationCard) {
      console.log(`[SECURITY] Donation card not found: ${donationCardId} from IP ${req.ip}`);
      return res.status(404).json({ error: 'Donation card not found.' });
    }

    if (donationCard.status !== 'active') {
      console.log(`[SECURITY] Inactive donation card accessed: ${donationCardId} from IP ${req.ip}`);
      return res.status(400).json({ error: 'This donation card is not available.' });
    }
  } catch (dbError) {
    console.error('❌ Database error checking donation card:', dbError);
    return res.status(500).json({ error: 'Failed to verify donation card. Please try again.' });
  }

  // ========== CREATE SESSION ==========
  
  try {
    console.log(`[SECURITY] Donation session created: amount=$${amountInt/100}, cardId=${donationCardId}, cardName=${donationCard.name}, ip=${req.ip}`);
    
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Donation: ${donationCard.name || 'Support'}`,
            },
            unit_amount: amountInt, // Use validated amount
          },
          quantity: 1,
        },
      ],
      payment_method_types: ['card'],
      mode: 'payment',
      billing_address_collection: 'auto', // Changed from 'required' for privacy
      customer_creation: 'if_required', // Only create customer when needed, reduces clutter
      success_url: `${process.env.CLIENT_URL}/donation?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/donation?canceled=true`,
      metadata: {
        donation_card_id: donationCardId,
      },
      payment_intent_data: {
        metadata: {
          donation_card_id: donationCardId,
        },
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ error: 'Failed to create donation session. Please try again.' });
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
    // Only return active donation cards
    const donationCards = await DonationCard.find({ status: 'active' });
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
    const paymentIntentId = session.payment_intent; // Get payment intent ID for faster refund/dispute lookups

    console.log(`🎉 Donation received: $${(amountCents / 100).toFixed(2)} from ${customerName || 'Anonymous'}`);

    try {
      // Atomic upsert: prevents race condition between concurrent webhooks
      // $setOnInsert only sets fields if document is newly created
      const result = await Donation.updateOne(
        { stripeSessionId: session.id },
        {
          $setOnInsert: {
            donationCardId: new mongoose.Types.ObjectId(donationCardId),
            amount: amountCents,
            currency: currency,
            donorEmail: customerEmail,
            donorName: customerName, // Will use schema default 'Anonymous' if undefined
            stripeSessionId: session.id,
            stripePaymentIntentId: paymentIntentId, // Store for faster refund/dispute lookups
            status: 'completed',
          },
        },
        { upsert: true }
      );

      // Check if this was a new insertion (upsertedCount === 1) or existing document (upsertedCount === 0)
      if (result.upsertedCount === 0) {
        console.log('⚠️  Duplicate webhook received (already processed), skipping...');
        return res.json({ received: true });
      }

      console.log('✅ Donation saved to DB.');

      // Send "Thank You" Email (only if amount meets minimum threshold)
      const MIN_AMOUNT_FOR_EMAIL = 200; // $2.00 minimum to send thank you email (matches MIN_AMOUNT)
      if (customerEmail && amountCents >= MIN_AMOUNT_FOR_EMAIL) {
        const formattedAmount = (amountCents / 100).toFixed(2);
        await sendThankYouEmail(customerEmail, customerName, formattedAmount);
      } else if (customerEmail && amountCents < MIN_AMOUNT_FOR_EMAIL) {
        console.log(`📧 Email skipped for donation < $${MIN_AMOUNT_FOR_EMAIL / 100}`);
      }

      // Explicitly return after processing this event
      return res.json({ received: true });

    } catch (error) {
      // Handle duplicate key error gracefully (unique index on stripeSessionId)
      // This should rarely happen now with atomic upsert, but keep as safety net
      if (error.code === 11000) {
        console.log('⚠️  Duplicate webhook received (duplicate key), skipping...');
        return res.json({ received: true });
      }
      console.error('❌ Error saving donation to DB:', error);
      // Do not return error to Stripe to avoid infinite retries on DB failure
    }
  }

  // Handle "Charge Refunded" - Update donation status to 'refunded'
  if (event.type === 'charge.refunded') {
    const charge = event.data.object;

    try {
      // Use payment intent ID for direct lookup (faster than session lookup)
      if (charge.payment_intent) {
        const donation = await Donation.findOne({ stripePaymentIntentId: charge.payment_intent });
        if (donation) {
          donation.status = 'refunded';
          await donation.save();
          console.log(`🔄 Donation ${donation._id} marked as refunded`);
        } else {
          console.warn(`⚠️  Donation not found for refunded payment intent: ${charge.payment_intent}`);
        }
      } else {
        console.warn(`⚠️  No payment intent found for refunded charge: ${charge.id}`);
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

      // Use payment intent ID for direct lookup (faster than session lookup)
      if (charge.payment_intent) {
        const donation = await Donation.findOne({ stripePaymentIntentId: charge.payment_intent });
        if (donation) {
          donation.status = 'disputed';
          await donation.save();
          console.log(`⚠️  Donation ${donation._id} marked as disputed`);
        } else {
          console.warn(`⚠️  Donation not found for disputed payment intent: ${charge.payment_intent}`);
        }
      } else {
        console.warn(`⚠️  No payment intent found for disputed charge: ${chargeId}`);
      }
    } catch (error) {
      console.error('❌ Error updating donation status to disputed:', error);
    }
  }

  // Acknowledge receipt to Stripe
  res.json({ received: true });
};

// --- 3. NEW: INTERNAL HELPER (Not exported) ---

// Helper function to escape HTML to prevent XSS in email
const escapeHtml = (text) => {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

const sendThankYouEmail = async (email, name, amount) => {
  try {
    // Escape user-provided input to prevent XSS in email
    const safeName = escapeHtml(name || 'Anonymous');
    const safeAmount = escapeHtml(amount);

    const data = await resend.emails.send({
      from: 'LeagueInteractions <onboarding@resend.dev>', // Update this for Production!
      to: [email],
      subject: 'Thank You for Your Donation! 💖',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #000; text-transform: uppercase;">Thank You, ${safeName}!</h2>
          <p>We successfully received your donation of <strong>$${safeAmount}</strong>.</p>
          <p>Your support helps us keep the servers running.</p>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            <em>Note: For small transactions, your bank may display a slightly different pending amount before it settles.</em>
          </p>
        </div>
      `,
    });

    if (data.error) console.error('❌ Resend API Error:', data.error);
    else console.log(`📧 Email sent to ${email}`);

  } catch (error) {
    console.error('❌ Error sending email via Resend:', error.message);
  }
};