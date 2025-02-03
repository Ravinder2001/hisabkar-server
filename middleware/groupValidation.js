const commonController = require("../controller/common.controller");
const groupModel = require("../model/group.model");
const dbValidation = require("../utils/common/validation/dbValidation");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");

module.exports = {
  validateGroupCode: async (req, res, next) => {
    const groupCode = req.params.group_code;
    try {
      const data = await groupModel.findGroupByCode(groupCode);
      if (!data) {
        return commonController.errorResponse(res, Messages.INVALID_GROUP_CODE, HttpStatus.BAD_REQUEST);
      }
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
  validateExistingGroup: async (req, res, next) => {
    const groupCode = req.params.group_code;
    const userId = req.user.user_id;
    try {
      const data = await groupModel.getAllGroupMemebersByCode(groupCode);
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
  validateExpenseId: async (req, res, next) => {
    const { expense_id } = req.params;
    try {
      const status = await dbValidation(expense_id, "tbl_expenses", "expense_id");
      if (status === HttpStatus.BAD_REQUEST) {
        return commonController.errorResponse(res, "Not a valid Expense id", HttpStatus.BAD_REQUEST);
      } else if (status === HttpStatus.NOT_FOUND) {
        return commonController.errorResponse(res, `Expense not found with the id ${expense_id}`, HttpStatus.NOT_FOUND);
      }
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
};
