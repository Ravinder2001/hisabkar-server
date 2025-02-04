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
};
