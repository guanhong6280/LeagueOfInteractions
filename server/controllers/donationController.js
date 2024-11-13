const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

exports.createStripeSession = async (req, res) => {
  const { amount } = req.body; // Amount in cents

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "donation"
            },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      payment_method_types: ['card'],
      mode: "payment",
      billing_address_collection: 'required', // Prompt for billing details including name
      customer_creation: 'always', // Always create a customer object
      success_url: `${process.env.CLIENT_URL}/donation?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/donation?canceled=true`
    });

    res.json({ url: session.url })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};