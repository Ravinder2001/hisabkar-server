const cron = require("node-cron");
const { deleteExpiredGroup } = require("../model/group.model");

// Cron job to run at 00:00 (midnight) every day
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Cron job scheduled to run every night at 00:00 hrs.");
    console.log("Running cron job to clean up expired groups at midnight...");
    await deleteExpiredGroup();
    console.log("Deleted expired groups");
  } catch (error) {
    console.log("Error in deleting expired groups:", error.message);
  }
});
