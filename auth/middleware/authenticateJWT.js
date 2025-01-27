const passport = require("passport");
require("../strategies/jwtStrategy");
const { errorResponse } = require("../../controller/common.controller");
const { HttpStatus } = require("../../utils/constant/constant");
const Messages = require("../../utils/constant/messages");

module.exports = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return errorResponse(res, err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      if (info && info.message) {
        return errorResponse(res, info.message, HttpStatus.UNAUTHORIZED);
      }
      return errorResponse(res, Messages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    // User authenticated successfully, proceed to controller
    req.user = user; // Optionally set user to req.user if needed by subsequent middleware
    next();
  })(req, res, next);
};
