const Joi = require("joi");
const constant = require("../../utils/constant/constant");

module.exports = {
  addExpense: Joi.object().keys({
    expenseName: Joi.string().required().max(constant.LENGTH_VALIDATIONS.NAME),
    splitType: Joi.string().required().max(constant.LENGTH_VALIDATIONS.NAME),
    expenseTypeId: Joi.number().required().max(constant.LENGTH_VALIDATIONS.ID),
    description: Joi.string().optional().allow("").max(constant.LENGTH_VALIDATIONS.DES),
    amount: Joi.number().required().min(1).max(constant.LENGTH_VALIDATIONS.AMOUNT),
    members: Joi.array()
      .items({
        userId: Joi.number().required().max(constant.LENGTH_VALIDATIONS.ID),
        amount: Joi.number().required().max(constant.LENGTH_VALIDATIONS.AMOUNT),
      })
      .required()
      .min(2),
  }),
};
