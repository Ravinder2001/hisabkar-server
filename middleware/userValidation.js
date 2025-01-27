const commonController = require("../controller/common.controller");
const dbValidationForDuplicate = require("../utils/common/validation/dbValidationForDuplicate");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");

module.exports = {
  validateEmail: async (req, res, next) => {
    const { email } = req.body;
    try {
      const status = await dbValidationForDuplicate(email, "tbl_users", "email");
      if (status === HttpStatus.BAD_REQUEST) {
        return commonController.errorResponse(res, Messages.INVALID_PAYLOAD, HttpStatus.BAD_REQUEST);
      } else if (status === HttpStatus.ALREADY_EXISTS) {
        return commonController.errorResponse(res, Messages.ALREADY_EXISTS(email, "Email"), HttpStatus.ALREADY_EXISTS);
      }
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
};
