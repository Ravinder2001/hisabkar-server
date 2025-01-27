const moment = require("moment");

/**
 * Generates a timestamp in Asia/Kolkata timezone.
 * @param {string} format - The desired date-time format.
 * @returns {string} - The formatted timestamp.
 */
function generateTimestamp(format = "YYYY-MM-DD HH:mm:ss") {
  return moment().utcOffset("+05:30").format(format);
}

module.exports = generateTimestamp;
