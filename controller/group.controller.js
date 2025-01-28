const groupModel = require("../model/group.model");
const common = require("./common.controller");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");

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
      await groupModel.joinGroup({
        ...req.body,
        userId: req.user.user_id,
      });

      return common.successResponse(res, Messages.SUCCESS, HttpStatus.OK);
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
};
