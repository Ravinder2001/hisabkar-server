const express = require("express");
const validateBody = require("../helpers/validateBodyHelper");
const schemas = require("../validations/group/payloadValidation");
const GroupController = require("../controller/group.controller");
const { authenticateJWT } = require("../auth");
const validateData = require("../middleware/groupValidation");

const router = express.Router();

router.post("/createGroup", authenticateJWT, validateBody(schemas.createGroup), GroupController.createGroup);
router.post("/joinGroup", authenticateJWT, validateBody(schemas.joinGroup), validateData.validateGroup, validateData.validateExistingGroup, GroupController.joinGroup);

module.exports = router;
