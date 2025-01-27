const { errorResponse } = require("../../controller/common.controller");
const { HttpStatus } = require("../../utils/constant/constant");

function handlePassportError(res, error) {
  errorResponse(res, error.message || "Unauthorized", HttpStatus.UNAUTHORIZED);
}

module.exports = handlePassportError;
