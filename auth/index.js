const handlePassportError = require("./errors/handlePassportError");
const authenticateJWT = require("./middleware/authenticateJWT");

module.exports = {
  handlePassportError,
  authenticateJWT,
};
