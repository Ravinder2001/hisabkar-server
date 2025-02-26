const express = require("express");
const validateBody = require("../helpers/validateBodyHelper");
const schemas = require("../validations/expense/payloadValidation");
const ExpenseController = require("../controller/expense.controller");
const { authenticateJWT } = require("../auth");
const validateData = require("../middleware/groupValidation");
const validateExpenseData = require("../middleware/expenseValidation");

const router = express.Router();

router.get("/expenseTypeList", authenticateJWT, ExpenseController.getExpenseTypeList);
router.post(
  "/addExpense/:group_id",
  authenticateJWT,
  validateBody(schemas.addExpense),
  validateData.validateGroupId,
  validateData.validateGroupSettlement,
  validateExpenseData.validateExpenseAmount,
  validateExpenseData.validateGroupMembership,
  ExpenseController.addExpense
);
router.put(
  "/editExpense/:group_id/:expense_id",
  authenticateJWT,
  validateBody(schemas.addExpense),
  validateData.validateGroupId,
  validateData.validateExpenseId,
  validateData.validateGroupSettlement,
  validateExpenseData.validateExpenseAmount,
  validateExpenseData.validateGroupMembership,
  validateExpenseData.validateExpenseOwnership,
  ExpenseController.editExpense
);
router.get("/getAllExpenses/:group_id", authenticateJWT, validateData.validateGroupId, validateExpenseData.validateGroupMembership, ExpenseController.getAllExpenses);
router.delete(
  "/:group_id/:expense_id",
  authenticateJWT,
  validateData.validateGroupId,
  validateData.validateExpenseId,
  validateData.validateGroupSettlement,
  validateExpenseData.validateGroupMembership,
  validateExpenseData.validateExpenseOwnership,
  ExpenseController.deleteExpense
);

module.exports = router;
