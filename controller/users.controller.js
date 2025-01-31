const userModel = require("../model/users.model");
const common = require("./common.controller");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");
const generateOTP = require("../helpers/generateOTP");
const sendEmail = require("../helpers/sendEmail");
const emailContent = require("../utils/constant/emailContent");
const generateAvatarImage = require("../helpers/generateAvatar");

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
      const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
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
};
