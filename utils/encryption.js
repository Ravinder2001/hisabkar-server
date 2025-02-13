const crypto = require("crypto");
const config = require("../configuration/config");

const SECRET_KEY = Buffer.from(config.CRYPTO.SECRET_KEY, "utf-8"); // 32 bytes
const IV = Buffer.from(config.CRYPTO.IV_KEY, "utf-8"); // 16 bytes

const encryptData = (data) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, IV);
  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("base64"); // Use Base64 instead of Hex
};

const decryptData = (encryptedData) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, IV);
  let decrypted = decipher.update(Buffer.from(encryptedData, "base64"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
};

module.exports = { encryptData, decryptData };
