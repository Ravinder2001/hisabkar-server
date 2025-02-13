const commonController = require("../controller/common.controller");
const expenseModal = require("../model/expense.model");
const groupModal = require("../model/group.model");
// const dbValidation = require("../utils/common/validation/dbValidation");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");

module.exports = {
  validateExpenseAmount: async (req, res, next) => {
    const { amount, members } = req.body;

    try {
      // Step 1: Validate sum of members' amounts
      const totalAmount = members.reduce((sum, member) => sum + member.amount, 0);
      if (totalAmount !== amount) {
        return commonController.errorResponse(res, Messages.INVALID_AMOUNT(totalAmount, amount), HttpStatus.BAD_REQUEST);
      }

      // Proceed to the next middleware if everything is valid
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
  validateExpenseOwnership: async (req, res, next) => {
    const { expense_id } = req.params;
    const user_id = req.user.user_id;

    try {
      const groupData = await expenseModal.getExpenseDataById({
        expense_id,
      });
      if (groupData.paid_by != user_id) {
        return commonController.errorResponse(res, Messages.FORBIDDEN, HttpStatus.BAD_REQUEST);
      }
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
  validateExpenseGroupMembership: async (req, res, next) => {
    const { group_id } = req.params;
    const user_id = req.user.user_id;

    try {
      const groupData = await groupModal.getGroupDataById({
        groupId: group_id,
        userId: user_id,
      });
      // Check if the user is NOT part of the group members
      const isMember = groupData.members?.some((member) => member.id === user_id);

      if (!isMember) {
        return commonController.errorResponse(res, Messages.FORBIDDEN, HttpStatus.BAD_REQUEST);
      }
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
};
