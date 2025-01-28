const commonController = require("../controller/common.controller");
const groupModel = require("../model/group.model");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");

module.exports = {
  validateGroup: async (req, res, next) => {
    const { groupId, code } = req.body;
    try {
      const data = await groupModel.findGroupById(groupId);
      if (!data || data.code != code) {
        return commonController.errorResponse(res, Messages.INVALID_CREDS, HttpStatus.BAD_REQUEST);
      }
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
  validateExistingGroup: async (req, res, next) => {
    const { groupId } = req.body;
    const userId = req.user.user_id;
    try {
      const data = await groupModel.getAllGroupMemebers(groupId);
      const isUserInGroup = data.some((member) => member.user_id === userId && member.is_active);
      if (isUserInGroup) {
        return commonController.errorResponse(res, Messages.ALREADY_MEMBER, HttpStatus.BAD_REQUEST);
      }
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
};
