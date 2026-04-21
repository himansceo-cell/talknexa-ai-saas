const cron = require("node-cron");
const { db } = require("./firebaseAdmin");
const clientManager = require("./clientManager");

const initReminderService = () => {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    console.log("Running scheduled reminder check...");
    
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

      // 1. Fetch appointments for tomorrow that haven't been reminded
      const snapshot = await db.collection("appointments")
        .where("date", "==", tomorrowStr)
        .where("reminded", "==", false)
        .get();

      if (snapshot.empty) {
        console.log("No reminders to send for tomorrow.");
        return;
      }

      for (const doc of snapshot.docs) {
        const appointment = doc.data();
        const client = clientManager.clients.get(appointment.userId);

        if (client) {
          const message = `👋 Hello ${appointment.customerName}! This is a reminder for your ${appointment.service} appointment tomorrow at ${appointment.time}. We look forward to seeing you!`;
          
          try {
            await client.sendMessage(appointment.customerPhone, message);
            // 2. Mark as reminded so we don't send multiple times
            await doc.ref.update({ reminded: true });
            console.log(`Reminder sent to ${appointment.customerName} (${appointment.customerPhone})`);
          } catch (sendError) {
            console.error(`Failed to send reminder to ${appointment.customerPhone}:`, sendError);
          }
        } else {
          console.log(`WhatsApp client not active for user ${appointment.userId}. Skipping reminder.`);
        }
      }
    } catch (error) {
      console.error("Error in reminder service:", error);
    }
  });
};

module.exports = { initReminderService };
