const commonController = require("../controller/common.controller");
const { findGroupById } = require("../model/group.model");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");

module.exports = {
  validateGroup: async (req, res, next) => {
    const { groupId, code } = req.body;
    try {
      const data = await findGroupById(groupId);
      console.log("🚀  data:", data);
      if (!data || data.code != code) {
        return commonController.errorResponse(res, Messages.INVALID_CREDS, HttpStatus.BAD_REQUEST);
      }
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
};
