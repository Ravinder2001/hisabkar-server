const webpush = require("web-push");
const config = require("../configuration/config");

// Set VAPID details

webpush.setVapidDetails(`mailto:${config.NODEMAILER.EMAIL}`, config.VAPID.PUBLIC_KEY, config.VAPID.PRIVATE_KEY);

/**
 * Send Push Notification
 * @param {Object} subscription - The user's subscription object
 * @param {Object} payload - The notification payload (title, body, etc.)
 */
const sendNotificationsToUsers = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

module.exports = { sendNotificationsToUsers };
