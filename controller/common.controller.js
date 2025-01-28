const jwt = require("jsonwebtoken");
const config = require("../configuration/config");
const { HttpStatus } = require("../utils/constant/constant");
/**
 * Sends a successful JSON response with the specified message, optional status code, and optional data.
 * @author Ravinder Singh Negi
 * @param {Object} res - The Express response object.
 * @param {string} message - The message to be included in the response.
 * @param {number} [status=200] - The HTTP status code to be set for the response. Default is 200 (OK).
 * @param {any} [data] - Additional data to be included in the response.
 * @returns {Object} The Express response object.
 */
function successResponse(res, message, status = 200, data, count = null) {
  if (status === undefined) {
    status = 200;
  }
  return res.status(status).json({
    success: 1,
    message: message,
    data: data,
    ...(count >= 0 && count != null && { count: count }),
  });
}

/**
 * Sends a Error JSON response with the specified message, optional status code, and optional data.
 * @author Ravinder Singh Negi
 * @param {Object} res - The Express response object.
 * @param {string} message - The message to be included in the response.
 * @param {number} [status=500] - The HTTP status code to be set for the response. Default is 200 (OK).
 * @param {any} [data] - Additional data to be included in the response.
 * @returns {Object} The Express response object.
 */
function errorResponse(res, message, status = 500) {
  if (status === undefined) {
    status = 500;
  }
  return res.status(status).json({ success: 0, message: message });
}

/**
 * @desc Common error handling for Business logic controller
 * @author Ravinder Singh Negi
 * @param {error} - custom error
 * @param {*} res
 * @returns
 */
const handleAsyncError = (error, res) => {
  // common.logError(error); will add logger here
  console.log(error);

  return errorResponse(res, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
};

/**
 * @desc Function to check empty object
 * @param {object} obj
 * @returns true/false
 */
const isEmptyObj = (obj) => {
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
  }
  return true;
};

const generateUserToken = (data) => {
  return jwt.sign(
    {
      iss: "hisabkar-server",
      id: data.user_id,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
      iat: Math.round(new Date().getTime() / 1000),
      // exp: Math.round(new Date().getTime() / 1000) + 24 * 60 * 60,
    },
    config.jwt.secretKey,
    {
      expiresIn: "100d",
    }
  );
};

module.exports = {
  errorResponse: errorResponse,
  isEmptyObj,
  generateUserToken,
  successResponse,
  handleAsyncError,
};
