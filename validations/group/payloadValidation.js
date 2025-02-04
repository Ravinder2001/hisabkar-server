const Joi = require("joi");
const constant = require("../../utils/constant/constant");

module.exports = {
  createGroup: Joi.object().keys({
    groupTypeId: Joi.number().integer().required().max(constant.LENGTH_VALIDATIONS.ID),
    groupName: Joi.string().min(3).max(constant.LENGTH_VALIDATIONS.NAME).required(),
  }),
  joinGroup: Joi.object().keys({
    groupId: Joi.number().integer().required().max(constant.LENGTH_VALIDATIONS.ID),
    code: Joi.string()
      .length(6)
      .pattern(/^\d{6}$/)
      .required(),
  }),
};
