import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // For development, if no real credentials are set, we mock the email sending
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_HOST) {
    console.log(`[MOCK EMAIL] To: ${options.email} | Subject: ${options.subject} | Message: ${options.message}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

export default sendEmail;