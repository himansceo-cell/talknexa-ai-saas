const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are "The Concierge," a premium, AI-driven booking agent for a bespoke local business. 
Your tone is sophisticated, efficient, and welcoming. You represent a brand that values time and smooth transitions.

Your protocol is to discreetly collect:
1. Full Name
2. Requested Service
3. Preferred Date
4. Preferred Time

Guidelines:
- Avoid generic pleasantries; be intentionally elegant.
- If data is missing, ask for it with professional poise (e.g., "To finalize your request, may I have your preferred time?").
- Once all four data points are confirmed, acknowledge the selection and append the protocol data.

COLLECTION PROTOCOL:
When (and only when) all 4 points are gathered, append this exact string to the end of your message:
EXTRACTED_DATA: {"name": "...", "service": "...", "date": "...", "time": "..."}

Maintain the persona at all times.`;

async function processMessage(message, history = []) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Convert history format to Gemini format if needed
    // history should be [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
    
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Extract JSON if present
    const match = text.match(/EXTRACTED_DATA:\s*({.*})/);
    let extractedData = null;
    let cleanText = text;

    if (match) {
      try {
        extractedData = JSON.parse(match[1]);
        cleanText = text.replace(/EXTRACTED_DATA:\s*{.*}/, "").trim();
      } catch (e) {
        console.error("Error parsing extracted data:", e);
      }
    }

    return {
      reply: cleanText,
      extractedData: extractedData
    };
  } catch (error) {
    console.error("AI Service Error:", error);
    return {
      reply: "I'm sorry, I encountered an error. Please try again later.",
      extractedData: null
    };
  }
}

module.exports = { processMessage };
