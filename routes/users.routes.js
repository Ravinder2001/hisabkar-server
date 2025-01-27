const express = require("express");
const validateBody = require("../helpers/validateBodyHelper");
const schemas = require("../validations/users/payloadValidation");
const UserController = require("../controller/users.controller");
const guestDbValidate = require("../helpers/userDbValidate");
const validateData = require("../middleware/userValidation");

const router = express.Router();

router.get("/send-otp/:email_address", UserController.sendOTP);
router.post("/register", validateBody(schemas.registerUser), validateData.validateEmail, UserController.register);
router.post("/login", validateBody(schemas.loginUser), guestDbValidate.validateLogin, UserController.login);
router.post("/google-signin", validateBody(schemas.googleLogin), UserController.googleLogin);

module.exports = router;
