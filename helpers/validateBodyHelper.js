const { HttpStatus } = require("../utils/constant/constant");
const common = require("../controller/common.controller");
const Messages = require("../utils/constant/messages");

const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        convert: false,
      });
      if (error) {
        let err_msg = {};
        for (let counter in error.details) {
          // let k = error.details[counter].context.key || "key";
          let val = error.details[counter].message;
          err_msg = val;
        }
        return common.errorResponse(res, err_msg, HttpStatus.BAD_REQUEST);
      }
      if (!req.value) {
        req.value = {};
      }
      req.value["body"] = value;
      next();
    } catch {
      // common.logError(error);
      return common.errorResponse(res, Messages.SERVER_ERROR, HttpStatus.BAD_REQUEST);
    }
  };
};
module.exports = validateBody;
