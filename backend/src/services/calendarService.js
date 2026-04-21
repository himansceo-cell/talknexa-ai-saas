const { google } = require("googleapis");
const { db } = require("./firebaseAdmin");

/**
 * Checks if a specific time slot is available on the user's primary calendar.
 */
const isSlotAvailable = async (userId, date, time) => {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists() || !userDoc.data().googleToken) return true; // Assume available if not linked

    const { googleToken } = userDoc.data();
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    );
    oauth2Client.setCredentials(googleToken);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    
    const startDateTime = new Date(`${date}T${time}:00Z`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // 30 mins later

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        items: [{ id: "primary" }],
      },
    });

    const busySlots = response.data.calendars.primary.busy;
    return busySlots.length === 0;
  } catch (error) {
    console.error("Availability Check Error:", error);
    return true; // Fallback to true if check fails
  }
};

const createCalendarEvent = async (userId, appointment) => {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists() || !userDoc.data().googleToken) {
      console.log(`No Google Calendar linked for user ${userId}. Skipping sync.`);
      return null;
    }

    const { googleToken } = userDoc.data();
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    );
    oauth2Client.setCredentials(googleToken);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: `📅 ${appointment.service} - ${appointment.customerName}`,
      description: `WhatsApp Booking via TalkNexa\nCustomer: ${appointment.customerName}\nPhone: ${appointment.customerPhone}`,
      start: {
        dateTime: new Date(`${appointment.date}T${appointment.time}:00Z`).toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(new Date(`${appointment.date}T${appointment.time}:00Z`).getTime() + 30 * 60000).toISOString(),
        timeZone: "UTC",
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    return response.data.htmlLink;
  } catch (error) {
    console.error("Google Calendar Sync Error:", error);
    return null;
  }
};

module.exports = { createCalendarEvent, isSlotAvailable };
