const Joi = require("joi");
const constant = require("../../utils/constant/constant");

module.exports = {
  registerUser: Joi.object().keys({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.base": "Email must be a string",
        "string.email": "Email must be a valid email address",
        "any.required": "Email is required",
      })
      .max(constant.LENGTH_VALIDATIONS.EMAIL),
    name: Joi.string().min(1).max(constant.LENGTH_VALIDATIONS.NAME).required().messages({
      "string.base": "Full name must be a string",
      "string.min": "Full name must not be empty",
      "string.max": "Full name must be at most 100 characters long",
      "any.required": "Full name is required",
    }),
    upiAddress: Joi.string().min(1).max(constant.LENGTH_VALIDATIONS.EMAIL).required().messages({
      "string.base": "UPI Address must be a string",
      "string.min": "UPI Address must not be empty",
      "string.max": "UPI Address must be at most 100 characters long",
      "any.required": "UPI Address is required",
    }),
    otp: Joi.string()
      .length(6)
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.base": "OTP must be a string",
        "string.length": "OTP must be exactly 6 digits long",
        "string.pattern.base": "OTP must contain only digits",
        "any.required": "OTP is required",
      }),
  }),
  loginUser: Joi.object().keys({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.base": "Email must be a string",
        "string.email": "Email must be a valid email address",
        "any.required": "Email is required",
      })
      .max(constant.LENGTH_VALIDATIONS.EMAIL),
    otp: Joi.string()
      .length(6)
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.base": "OTP must be a string",
        "string.length": "OTP must be exactly 6 digits long",
        "string.pattern.base": "OTP must contain only digits",
        "any.required": "OTP is required",
      }),
  }),
  googleLogin: Joi.object().keys({
    token: Joi.string()
      .required()
      .messages({
        "string.base": "Token must be a string",
        "any.required": "Token is required",
      })
      .max(5000),
  }),
  subscriptionSchema: Joi.object({
    endpoint: Joi.string().uri().max(500).required(), // Max length of 500 characters
    expirationTime: Joi.string().optional().allow(null),
    keys: Joi.object({
      p256dh: Joi.string().max(256).required(), // Max length of 256 characters
      auth: Joi.string().max(128).required(), // Max length of 128 characters
    }).required(),
  }),
};
