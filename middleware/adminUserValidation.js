const commonController = require("../controller/common.controller");
const { HttpStatus, USER_TYPES } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");

module.exports = {
  validateAdminUser: async (req, res, next) => {
    const { role } = req.user;
    try {
      if (role != USER_TYPES.ADMIN) {
        return commonController.errorResponse(res, Messages.ACCESS_DENIED, HttpStatus.BAD_REQUEST);
      }
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
};
