const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const sgEmail = require("@sendgrid/mail");


// Set up SendGrid API key
sgEmail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed.`, err.message);
    return res.sendStatus(400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_details.email;
    const amountTotal = (session.amount_total / 100).toFixed(2);
    console.log(`🎉 Checkout session completed! Customer email: ${customerEmail}`);

    // Retrieve customer details for the cardholder's name
    const customer = await stripe.customers.retrieve(session.customer);
    const cardholderName = customer.name;

    console.log(`Cardholder Name: ${cardholderName}`);

    // Call your email service here to send the thank-you email
    sendThankYouEmail(customerEmail, cardholderName, amountTotal);
  }

  res.status(200).end();
});

const sendThankYouEmail = async (email, name, amount) => {
  const msg = {
    to: email,
    from: "guanhong.jiang6280@gmail.com",
    subject: "Thank you for your Donation!",
    template_id: "d-0903407bc24a4320a31a36fcf95f855d",
    dynamic_template_data: {
      name: name,
      amount: amount
    }
  };
  // Implementation for sending the thank-you email
  try {
    await sgEmail.send(msg);
    console.log(`📧 Email successfully sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending email: ${error}`);
  }
};

module.exports = router;