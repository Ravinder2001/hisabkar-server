const nodemailer = require("nodemailer");
const config = require("../configuration/config");

// Create a transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.NODEMAILER.EMAIL,
    pass: config.NODEMAILER.PASSWORD,
  },
});

/**
 * Send email with dynamic options
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email text content
 */
async function sendEmail(to, data) {
  if (!to) {
    throw new Error("Recipient email is required.");
  }
  if (!data.subject || !data.text) {
    throw new Error("Email Subject, and text are required.");
  }

  // Mail options
  const mailOptions = {
    from: `"Hisabkar" <${config.NODEMAILER.EMAIL}>`, // Sender email
    to, // Recipient email
    subject: data.subject, // Subject line
    text: data.text, // Plain text body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error;
  }
}

module.exports = sendEmail;
