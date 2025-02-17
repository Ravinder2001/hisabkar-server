const userModel = require("../model/users.model");
const common = require("./common.controller");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");
const sendEmail = require("../helpers/sendEmail");
const emailContent = require("../utils/constant/emailContent");
const config = require("../configuration/config");
const { generateAvatarImage, generateOTP, maskEmail } = require("../utils/common/common");

module.exports = {
  sendOTP: async (req, res) => {
    try {
      let otp = generateOTP();
      const email = req.params.email;
      await userModel.sendOTP({ email, otp });
      await sendEmail(req.params.email, emailContent.OTP({ otp }));
      console.log(`OTP-${otp} for ${email}`);
      return common.successResponse(res, Messages.OTP_SENT, HttpStatus.OK);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  sendLoginOTP: async (req, res) => {
    try {
      let otp = generateOTP();
      const email = req.params.email;
      await userModel.sendLoginOTP({ email, otp });
      await sendEmail(req.params.email, emailContent.OTP({ otp }));
      console.log(`OTP-${otp} for ${email}`);
      return common.successResponse(res, Messages.OTP_SENT, HttpStatus.OK);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  register: async (req, res) => {
    try {
      let avatarImage = generateAvatarImage();
      await userModel.register({ ...req.body, avatar: avatarImage });
      const user = await userModel.getUserDetailsByEmail(req.body.email);

      if (!user) {
        return res.status(401).json({ message: Messages.INVALID_CREDS, success: 0 });
      }

      const token = await common.generateUserToken(user);

      sendEmail(user.email, emailContent.WelcomeMail({ name: req.body.name }));
      return common.successResponse(res, Messages.USER_REGISTER_SUCCESS, HttpStatus.OK, {
        token,
      });
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  login: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await userModel.getUserDetailsByEmail(email);

      if (!user) {
        return res.status(401).json({ message: Messages.INVALID_CREDS, success: 0 });
      }

      const token = await common.generateUserToken(user);

      sendEmail(user.email, emailContent.LoginDetected({ blockLink: "" }));
      return common.successResponse(res, Messages.LOGIN_SUCCESS, HttpStatus.OK, {
        token,
      });
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  googleLogin: async (req, res) => {
    try {
      const access_token = req.body.token;

      // Use the access_token to get user info from Google's UserInfo endpoint
      const response = await fetch(config.GOOGLE.GOOGLE_INFO_ENDPOINT, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!response.ok) {
        // If the response is not ok, return an error
        return res.status(401).json({ message: "Invalid token", success: 0 });
      }

      const data = await response.json(); // Parse the response JSON
      const { email } = data; // Extract the email from the response
      const user = await userModel.getUserDetailsByEmail(email);

      if (!user) {
        return res.status(401).json({ message: Messages.USER_NOT_FOUND, success: 0 });
      }

      const token = await common.generateUserToken(user);

      return common.successResponse(res, Messages.LOGIN_SUCCESS, HttpStatus.OK, {
        token,
      });
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  sWSubscribe: async (req, res) => {
    try {
      await userModel.sWSubscribe({ ...req.body, userId: req.user.user_id });
      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  getUserProfileDetails: async (req, res) => {
    try {
      const response = await userModel.getUserProfileDetails(req.user.user_id);
      const maskedEmail = maskEmail(response.email);
      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, { ...response, email: maskedEmail });
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  generateNewAvatars: async (req, res) => {
    try {
      let avatarImage1 = generateAvatarImage();
      let avatarImage2 = generateAvatarImage();
      let avatarImage3 = generateAvatarImage();
      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, [avatarImage1, avatarImage2, avatarImage3]);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  updateProfileDetails: async (req, res) => {
    try {
      await userModel.updateProfileDetails({ ...req.body, userId: req.user.user_id });
      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  toggleAvailiblityStatus: async (req, res) => {
    try {
      await userModel.toggleAvailiblityStatus(req.user.user_id);
      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
};
