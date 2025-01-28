const userModel = require("../model/users.model");
const common = require("./common.controller");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");
const { OAuth2Client } = require("google-auth-library");
const config = require("../configuration/config");
const generateOTP = require("../helpers/generateOTP");
const sendEmail = require("../helpers/sendEmail");
const emailContent = require("../utils/constant/emailContent");
const generateAvatarImage = require("../helpers/generateAvatar");

const client = new OAuth2Client(config.GOOGLE.GOOGLE_CLIENT_ID);

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
      return common.successResponse(res, Messages.USER_REGISTER_SUCCESS, HttpStatus.OK);
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
      const id_token = req.body.token;

      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const email = payload.email;

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
