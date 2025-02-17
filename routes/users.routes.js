const express = require("express");
const validateBody = require("../helpers/validateBodyHelper");
const schemas = require("../validations/users/payloadValidation");
const UserController = require("../controller/users.controller");
const guestDbValidate = require("../helpers/userDbValidate");
const validateData = require("../middleware/userValidation");
const { authenticateJWT } = require("../auth");
const validateParams = require("../helpers/validateParamsHelper");

const router = express.Router();

router.get("/send-otp/:email", validateParams(schemas.emailValidation), validateData.validateNonVerifiedEmail, UserController.sendOTP);
router.post("/register", validateBody(schemas.registerUser), validateData.validateNonVerifiedEmail, validateData.validateVerifedEmail, validateData.validateOTP, UserController.register);
router.get("/login-send-otp/:email", validateParams(schemas.emailValidation), validateData.validateEmail, UserController.sendLoginOTP);
router.post("/login", validateBody(schemas.loginUser), guestDbValidate.validateLogin, validateData.validateOTP, UserController.login);
router.post("/google-signin", validateBody(schemas.googleLogin), UserController.googleLogin);
router.post("/service-worker-subscribe", authenticateJWT, validateBody(schemas.subscriptionSchema), UserController.sWSubscribe);
router.get("/", authenticateJWT, UserController.getUserProfileDetails);
router.put("/", authenticateJWT, validateBody(schemas.updateProfileDetails), UserController.updateProfileDetails);
router.get("/generateAvatars", authenticateJWT, UserController.generateNewAvatars);
router.get("/toggleAvailibiltyStatus", authenticateJWT, UserController.toggleAvailiblityStatus);

module.exports = router;
