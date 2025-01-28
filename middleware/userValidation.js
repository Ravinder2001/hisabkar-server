const commonController = require("../controller/common.controller");
const { checkNonVerifiedEmail, validateOTP, checkVerifiedEmail, getUserDetailsByEmail } = require("../model/users.model");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");

module.exports = {
  validateVerifedEmail: async (req, res, next) => {
    const { email } = req.body;
    try {
      const count = await checkNonVerifiedEmail(email);
      if (count == 0) {
        return commonController.errorResponse(res, Messages.USER_NOT_FOUND, HttpStatus.BAD_REQUEST);
      }
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
  validateEmail: async (req, res, next) => {
    const { email } = req.params;
    try {
      const data = await getUserDetailsByEmail(email);
      if (!data || !data.is_verified) {
        return commonController.errorResponse(res, Messages.USER_NOT_FOUND, HttpStatus.BAD_REQUEST);
      } else if (!data.is_active) {
        return commonController.errorResponse(res, Messages.USER_DEACTIVATED, HttpStatus.BAD_REQUEST);
      }
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
  validateOTP: async (req, res, next) => {
    const { otp, email } = req.body;
    try {
      const count = await validateOTP({ email, otp });
      if (count == 0) {
        return commonController.errorResponse(res, Messages.WRONG_OTP, HttpStatus.BAD_REQUEST);
      }
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
  validateNonVerifiedEmail: async (req, res, next) => {
    const email = req.params.email ?? req.body.email;
    try {
      const count = await checkVerifiedEmail(email);
      if (count > 0) {
        return commonController.errorResponse(res, Messages.USER_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
      }
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
};
