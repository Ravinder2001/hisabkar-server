const config = require("../configuration/config");

const avatarURL = config.AVATAR_WEBSITE; // Ensure this is set to DiceBear's API base URL
const generateAvatarImage = () => {
  const random = Math.floor(Math.random() * 100);
  const avatar = `${avatarURL}/7.x/adventurer/svg?seed=${random}&gender=male`;
  return avatar;
};

module.exports = generateAvatarImage;
