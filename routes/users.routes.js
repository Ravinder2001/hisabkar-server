const express = require("express");
const validateBody = require("../helpers/validateBodyHelper");
const schemas = require("../validations/users/payloadValidation");
const UserController = require("../controller/users.controller");
const guestDbValidate = require("../helpers/userDbValidate");
const validateData = require("../middleware/userValidation");

const router = express.Router();

router.get("/send-otp/:email", validateData.validateNonVerifiedEmail, UserController.sendOTP);
router.post("/register", validateBody(schemas.registerUser), validateData.validateNonVerifiedEmail, validateData.validateVerifedEmail, validateData.validateOTP, UserController.register);
router.get("/login-send-otp/:email", validateData.validateEmail, UserController.sendLoginOTP);
router.post("/login", validateBody(schemas.loginUser), guestDbValidate.validateLogin, validateData.validateOTP, UserController.login);
router.post("/google-signin", validateBody(schemas.googleLogin), UserController.googleLogin);

module.exports = router;
//negi chodu
