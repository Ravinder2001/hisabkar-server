const rateLimit = require("express-rate-limit");

const commonLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 2000, // Limit each IP to 20 requests per minute
  standardHeaders: "draft-7", // Use RateLimit header
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 3, // Limit each IP to 3 authentication attempts per minute
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

module.exports = {
  commonLimiter,
  authLimiter,
};
