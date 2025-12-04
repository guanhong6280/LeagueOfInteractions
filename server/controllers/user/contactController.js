const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const data = await resend.emails.send({
      from: 'LeagueInteractions Contact <onboarding@resend.dev>',
      to: [process.env.CONTACT_EMAIL || 'delivered@resend.dev'],
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
      replyTo: email,
    });

    if (data.error) {
      console.error('Resend error:', data.error);
      return res.status(500).json({ message: 'Failed to send email', error: data.error });
    }

    res.status(200).json({ message: 'Email sent successfully', data });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

