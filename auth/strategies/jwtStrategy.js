/**
 * Module dependencies.
 */
const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

/**
 * Module imports.
 */
const userModel = require("../../model/users.model");
const config = require("../../configuration/config");
const Messages = require("../../utils/constant/messages");

/**
 * JWT options for passport-jwt strategy.
 * @type {Object}
 * @property {Function} jwtFromRequest - Function to extract JWT token from the request.
 * @property {string} secretOrKey - Secret key used to verify the JWT token.
 */
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.secretKey,
};

/**
 * Passport JWT strategy for admin authentication.
 * @param {Object} payload - Decoded JWT payload.
 * @param {Function} done - Callback function to indicate authentication success or failure.
 * @returns {Promise<void>} - Promise that resolves when authentication is complete.
 */

passport.use(
  "jwt",
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      if (!payload.iss) {
        return done(null, false, { message: Messages.UNAUTHORIZED });
      }

      const user = await userModel.getUserDetailsByID(payload.id);

      if (!user) {
        return done(null, false);
      }

      delete user.password;

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

/**
 * Module exports.
 */
module.exports = passport;
