const commonController = require("../controller/common.controller");
// const dbValidation = require("../utils/common/validation/dbValidation");
const { HttpStatus } = require("../utils/constant/constant");
const Messages = require("../utils/constant/messages");

module.exports = {
  validateExpenseAmount: async (req, res, next) => {
    const { amount, members } = req.body;

    try {
      // Step 1: Validate sum of members' amounts
      const totalAmount = members.reduce((sum, member) => sum + member.amount, 0);
      if (totalAmount !== amount) {
        return commonController.errorResponse(res, Messages.INVALID_AMOUNT(totalAmount, amount), HttpStatus.BAD_REQUEST);
      }

      // Proceed to the next middleware if everything is valid
      next();
    } catch (error) {
      return commonController.handleAsyncError(error, res);
    }
  },
};
