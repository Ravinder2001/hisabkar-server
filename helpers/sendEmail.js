const nodemailer = require("nodemailer");
const config = require("../configuration/config");

// Create a transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.nodemailer.email,
    pass: config.nodemailer.password,
  },
});

/**
 * Send email with dynamic options
 * @param {string} to - Recipient email address
 * @param {string} type - Email type ("otp" or "joining")
 * @param {object} data - Additional data for email (e.g., OTP or user details)
 */
async function sendEmail(to, type, data = {}) {
  let subject = "";
  let text = "";

  // Define email content based on type
  if (type === "otp") {
    subject = "Your OTP for Hisabkar";
    text = `Hello,\n\nYour OTP for Hisabkar is: ${data.otp}\n\nPlease use this OTP within 10 minutes.\n\nRegards,\nHisabkar Team`;
  } else if (type === "joining") {
    subject = "Welcome to Hisabkar!";
    text = `Hello ${data.name || "User"},\n\nWelcome to Hisabkar! We are excited to have you onboard.\n\nYour account has been successfully created.\n\nRegards,\nHisabkar Team`;
  } else {
    throw new Error("Invalid email type specified.");
  }

  // Mail options
  const mailOptions = {
    from: `"Hisabkar" <${config.nodemailer.email}>`, // Sender email
    to, // Recipient email
    subject,
    text,
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
