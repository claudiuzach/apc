// utils/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail', // You can use other services like Mailgun, SES, etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email app password
  },
});

export async function sendWelcomeEmail(to: string, username: string) {
  const mailOptions = {
    from: '"APC Team" <stilnegresti@gmail.com>', // Your email or sender name
    to,
    subject: 'Welcome to APC!',
    text: `Hi ${username},\n\nWelcome to APC! We're glad to have you on board.\n\nBest,\nThe APC Team`,
    html: `<p>Hi <strong>${username}</strong>,</p><p>Welcome to APC! We're glad to have you on board.</p><p>Best,<br>The APC Team</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully!');
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}
