const cron = require("node-cron");

// Cron job to run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("Running cron job to clean up trash files...");
  // return
});
