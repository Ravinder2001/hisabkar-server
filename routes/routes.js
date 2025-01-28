const express = require("express");
const router = express.Router();

const usersRouter = require("./users.routes");
const groupRouter = require("./group.routes");

router.use("/user", usersRouter);
router.use("/group", groupRouter);
module.exports = router;
