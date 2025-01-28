const express = require("express");
const validateBody = require("../helpers/validateBodyHelper");
const schemas = require("../validations/expense/payloadValidation");
const ExpenseController = require("../controller/expense.controller");
const { authenticateJWT } = require("../auth");
const validateData = require("../middleware/groupValidation");
const validateExpenseData = require("../middleware/expenseValidation");

const router = express.Router();

router.post("/addExpense/:group_id", authenticateJWT, validateBody(schemas.addExpense), validateData.validateGroupId, validateExpenseData.validateExpenseAmount, ExpenseController.addExpense);
router.put("/editExpense/:expense_id", authenticateJWT, validateBody(schemas.addExpense), validateData.validateExpenseId, validateExpenseData.validateExpenseAmount, ExpenseController.editExpense);
router.get("/getAllExpenses/:group_id", authenticateJWT, validateData.validateGroupId, ExpenseController.getAllExpenses);

module.exports = router;
