const groupModel = require("../model/group.model");
const common = require("./common.controller");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");
const { getExpenseChangeLog, trackExpenseChange } = require("../helpers/expenseLog");

module.exports = {
  createGroup: async (req, res) => {
    try {
      const createRes = await groupModel.createGroup({
        ...req.body,
        userId: req.user.user_id,
      });

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK, {
        code: createRes,
      });
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
};
