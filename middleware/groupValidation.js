const commonController = require("../controller/common.controller");
const groupModel = require("../model/group.model");
const dbValidation = require("../utils/common/validation/dbValidation");
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
  validateGroupId: async (req, res, next) => {
    const { group_id } = req.params;
    try {
      const status = await dbValidation(group_id, "tbl_groups", "group_id");
      if (status === HttpStatus.BAD_REQUEST) {
        return commonController.errorResponse(res, "Not a valid Group id", HttpStatus.BAD_REQUEST);
      } else if (status === HttpStatus.NOT_FOUND) {
        return commonController.errorResponse(res, `Group not found with the id ${group_id}`, HttpStatus.NOT_FOUND);
      }
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
};
