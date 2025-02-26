const userModel = require("../model/users.model");
const common = require("../controller/common.controller");
const Messages = require("../utils/constant/messages");

module.exports = {
  async validateLogin(req, res, next) {
    const { email } = req.value.body;

    try {
      let err = {};
      const userExist = await userModel.getUserDetailsByEmail(email);

      if (!userExist) {
        err.message = Messages.USER_NOT_FOUND;
      } else if (!userExist.is_active) {
        err.message = Messages.USER_DEACTIVATED;
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
