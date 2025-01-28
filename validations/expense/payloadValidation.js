const Joi = require("joi");

module.exports = {
  addExpense: Joi.object().keys({
    expenseName: Joi.string().required(),
    expenseTypeId: Joi.number().required(),
    description: Joi.string().optional(),
    amount: Joi.number().required().min(1).max(100000),
    members: Joi.array()
      .items({
        userId: Joi.number().required(),
        amount: Joi.number().required(),
      })
      .required()
      .min(2),
  }),
};
