module.exports = {
  OTP: (data) => ({
    subject: "Your OTP for Hisabkar",
    text: `Hello,\n\nYour OTP for Hisabkar is: ${data.otp}\n\nPlease use this OTP within 10 minutes.\n\nRegards,\nHisabkar Team`,
  }),
  LoginDetected: (data) => ({
    subject: "Login Detected on Your Hisabkar Account",
    text: `Hello,\n\nWe detected a login to your Hisabkar account from a new device or location.\n\nIf this was you, you can safely ignore this email. If this wasn't you, please click on the link below to block access to your account:\n\n${data.blockLink}\n\nRegards,\nHisabkar Team`,
  }),
  WelcomeMail: (data) => ({
    subject: "Welcome to Hisabkar",
    text: `Hello ${data.name},\n\nWelcome to Hisabkar! We're excited to have you on board.\n\nIf you have any questions or need assistance, feel free to reach out to our support team.\n\nRegards,\nHisabkar Team`,
  }),
};
