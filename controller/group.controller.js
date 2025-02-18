const groupModel = require("../model/group.model");
const common = require("./common.controller");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");
const { getExpenseChangeLog, trackExpenseChange } = require("../helpers/expenseLog");
const ExcelJS = require("exceljs");

module.exports = {
  createGroup: async (req, res) => {
    try {
      const createRes = await groupModel.createGroup({
        ...req.body,
        userId: req.user.user_id,
      });

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, createRes);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  joinGroup: async (req, res) => {
    try {
      const response = await groupModel.joinGroup({
        groupCode: req.params.group_code,
        userId: req.user.user_id,
      });

      await trackExpenseChange({
        groupId: response.group_id,
        expenseId: null,
        userId: req.user.user_id,
        actionType: "JOINED",
        oldAmount: null,
        newAmount: null,
      });

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, response);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  leaveGroup: async (req, res) => {
    try {
      const response = await groupModel.leaveGroup({
        groupId: req.params.group_id,
        userId: req.user.user_id,
      });

      await trackExpenseChange({
        groupId: req.params.group_id,
        expenseId: null,
        userId: req.user.user_id,
        actionType: "LEFT",
        oldAmount: null,
        newAmount: null,
      });

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, response);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  getAllGroups: async (req, res) => {
    try {
      let groupList = await groupModel.getAllGroups(req.user.user_id);

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, groupList, groupList.length);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  getGroupDataById: async (req, res) => {
    try {
      let groupList = await groupModel.getGroupDataById({
        groupId: req.params.group_id,
        userId: req.user.user_id,
      });

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, groupList);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  getGroupExpenseLogs: async (req, res) => {
    try {
      let groupList = await getExpenseChangeLog(req.params.group_id);

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, groupList);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  getGroupTypeList: async (req, res) => {
    try {
      let groupList = await groupModel.getGroupTypeList();

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, groupList);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  getMyPairs: async (req, res) => {
    try {
      let groupList = await groupModel.getMyPairs({
        group_id: req.params.group_id,
        user_id: req.user.user_id,
      });

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, groupList);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  toggleGroupSettlement: async (req, res) => {
    try {
      let response = await groupModel.toggleGroupSettlement({
        group_id: req.params.group_id,
        user_id: req.user.user_id,
      });

      await trackExpenseChange({
        groupId: req.params.group_id,
        expenseId: null,
        userId: req.user.user_id,
        actionType: response.is_settled ? "SETTLED" : "UNSETTLED",
        oldAmount: null,
        newAmount: null,
      });

      return common.successResponse(res, Messages.GROUP_SETTLEMNT_TOGGLE(response.is_settled), HttpStatus.OK);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  toggleGroupVisibilty: async (req, res) => {
    try {
      const response = await groupModel.toggleGroupVisibilty({
        group_id: req.params.group_id,
        user_id: req.user.user_id,
      });

      return common.successResponse(res, Messages.GROUP_STATUS_TOGGLE(response.is_active), HttpStatus.OK);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },

  downloadGroupData: async (req, res) => {
    try {
      const response = await groupModel.downloadGroupData({
        group_id: req.params.group_id,
      });

      const { group, members, expenses, expenseMembers } = response;

      // Step 1: Initialize a map to track total spent by each user
      const totalSpentMap = new Map();

      // Step 2: Iterate over expenses to calculate the total spent
      expenses.forEach((expense) => {
        const { paid_by, expense_amount } = expense;

        // Find the user ID for the person who paid
        const user = members.find((member) => member.name === paid_by);

        // If the user is found, add the expense amount to their total spent
        if (user) {
          const currentTotal = totalSpentMap.get(user.user_id) || 0;
          totalSpentMap.set(user.user_id, currentTotal + parseFloat(expense_amount));
        }
      });

      // Step 3: Create an array of each user with their total spent
      const result = members.map((member) => ({
        user_id: member.user_id,
        name: member.name,
        total_spent: totalSpentMap.get(member.user_id) || 0,
      }));

      // Create an Excel workbook
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Group Report");

      // Header - Group Info
      sheet.addRow(["Group Name:", group.group_name]);
      sheet.addRow(["Group Type:", group.group_type]);
      sheet.addRow(["Total Amount Spent:", group.total_amount]);
      sheet.addRow([]); // Blank row

      // Group Members Section
      sheet.addRow(["Group Members", "Total Spent"]);
      result.forEach((member) => {
        sheet.addRow([member.name, member.total_spent]);
      });

      sheet.addRow([]); // Blank row

      // Expenses Section
      sheet.addRow(["Expense Name", "Expense Type", "Expense Amount", "Created At", "Paid By", ...members.map((m) => m.name)]);

      expenses.forEach((expense) => {
        const expenseRow = [expense.expense_name, expense.expense_type, expense.expense_amount, expense.created_at, expense.paid_by];

        // Add amounts per user
        const memberAmounts = members.map((member) => {
          const memberExpense = expenseMembers.find((em) => em.expense_id === expense.expense_id && em.name === member.name);
          return memberExpense ? memberExpense.amount : 0;
        });

        sheet.addRow([...expenseRow, ...memberAmounts]);
      });

      // Backend response headers should include:
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=group_data.xlsx");
      // Send the file
      await workbook.xlsx.write(res);
      return res.end();
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
  getGroupLogs: async (req, res) => {
    try {
      const response = await groupModel.getGroupLogs({
        group_id: req.params.group_id,
        user_id: req.user.user_id,
      });

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, response, response.length);
    } catch (error) {
      common.handleAsyncError(error, res);
    }
  },
};
