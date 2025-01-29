const expenseModel = require("../model/expense.model");

const trackExpenseChange = async ({ groupId, expenseId, userId, actionType, oldAmount = null, newAmount = null }) => {
  try {
    const data = await expenseModel.logExpenseChange({
      groupId,
      expenseId,
      userId,
      actionType,
      oldAmount,
      newAmount,
    });
    return data;
  } catch (error) {
    console.error("Error logging expense change:", error.message);
    throw error;
  }
};

const getExpenseChangeLog = async (groupId) => {
  try {
    const data = expenseModel.getExpenseLogs(groupId);
    return data;
  } catch (error) {
    console.error("Error fetching expense logs:", error.message);
    throw error;
  }
};

module.exports = {
  trackExpenseChange,
  getExpenseChangeLog,
};
