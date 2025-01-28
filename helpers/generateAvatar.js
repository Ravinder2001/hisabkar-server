const config = require("../configuration/config");

const avatarURL = config.AVATAR_WEBSITE;
const generateAvatarImage = () => {
  const random = Math.floor(Math.random() * 100);
  const avatar = avatarURL + random + ".png";
  return avatar;
};

module.exports = generateAvatarImage;
