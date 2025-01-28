const Joi = require("joi");

module.exports = {
  createGroup: Joi.object().keys({
    groupTypeId: Joi.number().integer().required(),
    groupName: Joi.string().min(3).max(30).required(),
  }),
  joinGroup: Joi.object().keys({
    groupId: Joi.number().integer().required(),
    code: Joi.string()
      .length(6)
      .pattern(/^\d{6}$/)
      .required(),
  }),
};
