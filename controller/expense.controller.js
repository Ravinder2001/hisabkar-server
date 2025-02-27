const expenseModel = require("../model/expense.model");
const usersModel = require("../model/users.model");
const common = require("./common.controller");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");
const { trackExpenseChange } = require("../helpers/expenseLog");
const { sendNotificationsToUsers } = require("../helpers/pushService");

module.exports = {
  addExpense: async (req, res) => {
    try {
      const response = await expenseModel.addExpense({ ...req.body, groupId: req.params.group_id, paidBy: req.user.user_id });

      // Extract all user IDs from req.body.members except the current user
      const userIds = response.groupData.user_ids.filter((id) => id !== req.user.user_id);

      if (userIds.length) {
        let subscriptions = await usersModel.getUsersSWData(userIds);

        if (subscriptions.length) {
          // Send notifications to each subscription
          const payload = {
            title: response.groupData.group_name,
            body: `${response.expense_data.name} has added ₹${response.expenseData[0].amount}.`,
            group_id: req.params.group_id,
          };
          subscriptions.forEach((sub) => sendNotificationsToUsers(sub, payload));
        }
      }

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, response.expenseData);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  editExpense: async (req, res) => {
    try {
      const response = await expenseModel.editExpense({ ...req.body, expenseId: req.params.expense_id, paidBy: req.user.user_id });

      await trackExpenseChange({
        groupId: response.groupId,
        expenseId: req.params.expense_id,
        userId: req.user.user_id,
        actionType: "EDIT",
        oldAmount: response.oldAmount,
        newAmount: req.body.amount,
      });

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, response.expenseData);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  getAllExpenses: async (req, res) => {
    try {
      let data = await expenseModel.getAllExpenses({
        groupId: req.params.group_id,
        userId: req.user.user_id,
      });

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, data, data.length);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  deleteExpense: async (req, res) => {
    try {
      await expenseModel.deleteExpense(req.params.expense_id, req.user.user_id);

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  getExpenseTypeList: async (req, res) => {
    try {
      const response = await expenseModel.getExpenseTypeList();

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, response, response.length);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
};
