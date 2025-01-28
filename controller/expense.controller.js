const expenseModel = require("../model/expense.model");
const common = require("./common.controller");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");

module.exports = {
  addExpense: async (req, res) => {
    try {
      await expenseModel.addExpense({ ...req.body, groupId: req.params.group_id, paidBy: req.user.user_id });

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  editExpense: async (req, res) => {
    try {
      await expenseModel.editExpense({ ...req.body, expenseId: req.params.expense_id, paidBy: req.user.user_id });

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK);
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
};
