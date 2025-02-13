const express = require("express");
const router = express.Router();

const usersRouter = require("./users.routes");
const expenseRouter = require("./expense.routes");
const groupRouter = require("./group.routes");
const { authLimiter, commonLimiter } = require("../helpers/rateLimitorHelper");

router.use("/user", authLimiter, usersRouter);
router.use("/group", commonLimiter, groupRouter);
router.use("/expense", commonLimiter, expenseRouter);
module.exports = router;
