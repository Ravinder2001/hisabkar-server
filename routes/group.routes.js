const express = require("express");
const validateBody = require("../helpers/validateBodyHelper");
const schemas = require("../validations/group/payloadValidation");
const GroupController = require("../controller/group.controller");
const { authenticateJWT } = require("../auth");
const validateData = require("../middleware/groupValidation");

const router = express.Router();

router.post("/createGroup", authenticateJWT, validateBody(schemas.createGroup), GroupController.createGroup);
router.get("/joinGroup/:group_code", authenticateJWT, validateData.validateGroupCode, validateData.validateExistingGroup, GroupController.joinGroup);
router.get("/", authenticateJWT, GroupController.getAllGroups);
router.get("/single/:group_id", authenticateJWT, validateData.validateGroupId, GroupController.getGroupDataById);
router.get("/expenseLogs/:group_id", authenticateJWT, validateData.validateGroupId, GroupController.getGroupExpenseLogs);
router.get("/groupTypeList", authenticateJWT, GroupController.getGroupTypeList);
router.get("/", authenticateJWT, GroupController.getGroupTypeList);

module.exports = router;
