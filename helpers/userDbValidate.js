const userModel = require("../model/users.model");
const common = require("../controller/common.controller");
const { isValidPassword } = require("../utils/common/common");
const Messages = require("../utils/constant/messages");

module.exports = {
  async validateLogin(req, res, next) {
    const { email, password } = req.value.body;

    try {
      let err = {};
      const userExist = await userModel.getUserDetailsByEmail(email);

      if (!userExist) {
        err.message = Messages.USER_NOT_FOUND;
      } else if (!userExist.is_active) {
        err.message = Messages.USER_DEACTIVATED;
      } else {
        const isMatch = await isValidPassword(password, userExist.password);
        if (!isMatch) {
          err.message = Messages.WRONG_PASSWORD;
        }
      }

      if (common.isEmptyObj(err)) {
        next();
      } else {
        return res.status(400).json({ success: 0, message: err.message });
      }
    } catch (error) {
      console.error("Error during login validation:", error);
      return res.status(500).json({
        success: 0,
        message: Messages.SERVER_ERROR,
      });
    }
  },
};
