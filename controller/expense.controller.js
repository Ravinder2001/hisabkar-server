const expenseModel = require("../model/expense.model");
const common = require("./common.controller");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");
const { trackExpenseChange } = require("../helpers/expenseLog");

module.exports = {
  addExpense: async (req, res) => {
    try {
      const response = await expenseModel.addExpense({ ...req.body, groupId: req.params.group_id, paidBy: req.user.user_id });

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, response);
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
      const response = await expenseModel.deleteExpense(req.params.expense_id);
      await trackExpenseChange({
        groupId: response.groupId,
        expenseId: req.params.expense_id,
        userId: req.user.user_id,
        actionType: "DELETE",
        oldAmount: null,
        newAmount: null,
      });
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
