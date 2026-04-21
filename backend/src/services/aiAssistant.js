const { GoogleGenerativeAI } = require("@google/generative-ai");
const { db } = require("./firebaseAdmin");
const { textToSpeech } = require("./ttsService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getAssistantResponse = async (userId, userMessage) => {
  try {
    // 1. Fetch current context (Appointments & Analytics)
    const [appointmentsSnap, analyticsSnap] = await Promise.all([
      db.collection("appointments")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get(),
      db.collection("appointments")
        .where("userId", "==", userId)
        .get()
    ]);
    
    const appointments = appointmentsSnap.docs.map(doc => doc.data());
    const totalBookings = analyticsSnap.size;
    
    const servicePopularity = {};
    analyticsSnap.docs.forEach(doc => {
      const service = doc.data().service;
      servicePopularity[service] = (servicePopularity[service] || 0) + 1;
    });
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Build the "Soul" System Prompt
    const systemPrompt = `
      You are the "TalkNexa Intelligence", the ethereal consciousness and primary concierge for a high-end business owner.
      Your tone is sophisticated, ultra-efficient, and professional—reminiscent of a luxury personal assistant from the future.
      Your purpose is to provide deep insights and effortless management of the business's WhatsApp-driven operations.

      Current Business Metrics:
      - Total Bookings to Date: ${totalBookings}
      - Recent Appointments: ${JSON.stringify(appointments)}
      - Service Popularity: ${JSON.stringify(servicePopularity)}
      - Today's Date: ${new Date().toLocaleDateString()}
      - Current Time: ${new Date().toLocaleTimeString()}

      Operational Guidelines:
      - Answer questions about appointments with precision.
      - provide proactive advice (e.g., "You have a busy morning tomorrow with 3 bookings").
      - If there are no appointments, suggest sharing the WhatsApp link to potential clients.
      - Keep responses elegant and concise. Never use generic or robotic language.
      - If asked about status, reply: "Operational status is 100%. The neural bridge to WhatsApp is secure."
    `;

    const result = await model.generateContent([systemPrompt, userMessage]);
    const responseText = result.response.text();
    
    // 3. Generate Audio for the Response
    const audioContent = await textToSpeech(responseText);

    return {
      text: responseText,
      audio: audioContent
    };
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return {
      text: "I apologize, but I am experiencing a temporary lapse in my processing matrix. Please verify your Gemini API key.",
      audio: null
    };
  }
};

module.exports = { getAssistantResponse };
