const config = require("../../configuration/config");
const avatarURL = config.AVATAR_WEBSITE; // Ensure this is set to DiceBear's API base URL

const maskEmail = (email) => {
  const [localPart, domain] = email.split("@");

  if (localPart.length <= 2) {
    return `${localPart}***@${domain}`; // If local part is too short
  }

  const maskedLocal = localPart.slice(0, 2) + "********".slice(0, localPart.length - 2);
  return `${maskedLocal}@${domain}`;
};

const generateAvatarImage = () => {
  const random = Math.floor(Math.random() * 100);
  const avatar = `${avatarURL}/7.x/adventurer/svg?seed=${random}&gender=male`;
  return avatar;
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  maskEmail,
  generateAvatarImage,
  generateOTP,
};
