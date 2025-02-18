const express = require("express");
const validateBody = require("../helpers/validateBodyHelper");
const schemas = require("../validations/group/payloadValidation");
const GroupController = require("../controller/group.controller");
const { authenticateJWT } = require("../auth");
const validateData = require("../middleware/groupValidation");
const validateExpData = require("../middleware/expenseValidation");

const router = express.Router();

router.post("/createGroup", authenticateJWT, validateBody(schemas.createGroup), GroupController.createGroup);
router.get("/joinGroup/:group_code", authenticateJWT, validateData.validateGroupCode, validateData.validateExistingGroup, GroupController.joinGroup);
router.get("/leaveGroup/:group_id", authenticateJWT, validateData.validateGroupId, GroupController.leaveGroup);
router.get("/", authenticateJWT, GroupController.getAllGroups);
router.get("/single/:group_id", authenticateJWT, validateData.validateGroupId, validateExpData.validateGroupMembership, GroupController.getGroupDataById);
router.get("/expenseLogs/:group_id", authenticateJWT, validateData.validateGroupId, validateExpData.validateGroupMembership, GroupController.getGroupExpenseLogs);
router.get("/groupTypeList", authenticateJWT, GroupController.getGroupTypeList);
router.get("/myPairs/:group_id", authenticateJWT, validateData.validateGroupId, validateExpData.validateGroupMembership, GroupController.getMyPairs);
router.get(
  "/toggleGroupSettlement/:group_id",
  authenticateJWT,
  validateData.validateGroupId,
  validateData.validateGroupOwnerShip,
  validateExpData.validateGroupMembership,
  GroupController.toggleGroupSettlement
);
router.get(
  "/toggleGroupVisibilty/:group_id",
  authenticateJWT,
  validateData.validateGroupId,
  validateData.validateGroupOwnerShip,
  validateExpData.validateGroupMembership,
  GroupController.toggleGroupVisibilty
);
router.get("/downloadGroupData/:group_id", authenticateJWT, validateData.validateGroupId, validateExpData.validateGroupMembership, GroupController.downloadGroupData);
router.get("/groupLogs/:group_id", authenticateJWT, validateData.validateGroupId, validateExpData.validateGroupMembership, GroupController.getGroupLogs);
router.get("/spendAnalysis/:group_id/:user_id", authenticateJWT, validateData.validateGroupId, validateExpData.validateGroupMembership, GroupController.getGrpupSpendAnalysis);

module.exports = router;
