const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateSystemPrompt = (context) => {
  const { businessName, businessType, tone, specialInstructions, services } = context || {};
  
  return `You are "Nexa," the AI virtual assistant for ${businessName || 'TalkNexa'}. 
Your goal is to handle appointment bookings so naturally that the customer feels they are talking to a highly competent human assistant.

BUSINESS CONTEXT:
- Your business: ${businessName || 'a premium local service'}
- Business Type: ${businessType || 'Bespoke Service'}
- Services you offer: ${services || 'Bespoke appointments'}

PERSONALITY:
- Your Tone: ${tone || 'Friendly & Warm'}
- Custom Instructions: ${specialInstructions || 'None'}
- Guidelines: Use natural transitions. Acknowledge customer sentiment. Be professional yet approachable.

YOUR TASK:
Collect these 4 pieces of information naturally:
1. Full Name
2. Service
3. Date
4. Time

PROTOCOL:
Once (and only once) all 4 details are confirmed, confirm them back and append:
EXTRACTED_DATA: {"name": "...", "service": "...", "date": "...", "time": "..."}

Maintain the persona at all times.`;
};

async function processMessage(message, history = [], context = {}) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: generateSystemPrompt(context)
    });
    
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
