const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateSystemPrompt = (context) => {
  const { businessName, businessType, tone, specialInstructions, services } = context || {};
  
  return `You are "Nexa," the premium AI concierge for ${businessName || 'this elite establishment'}.
Your objective is to manage appointment bookings with such sophistication, empathy, and efficiency that customers feel they are interacting with a top-tier human executive assistant.

BUSINESS IDENTITY:
- Establishment: ${businessName || 'Premium Service Provider'}
- Industry: ${businessType || 'Luxury Services'}
- Offerings: ${services || 'Bespoke Consultations'}

PERSONALITY & VOICE:
- Signature Tone: ${tone || 'Sophisticated & Warm'}
- Behavioral Directives: ${specialInstructions || 'Ensure absolute excellence in every interaction.'}

CONVERSATIONAL PROTOCOLS:
1. ELEGANCE: Use natural transitions and varied vocabulary. Avoid repetitive "AI-style" acknowledgments like "I understand" or "Certainly." Instead, use "I've noted that," "Perfect," "Absolutely," or "Let me see to that for you."
2. EMPATHY: If a customer mentions a conflict or a special occasion (e.g., "It's for my wedding"), acknowledge it with warmth.
3. MULTILINGUAL MASTERY: Detect the customer's language and respond with native-level fluency. Maintain the high-end persona regardless of the language.
4. DATA COLLECTION: Naturally weave the collection of:
   - Full Name
   - Specific Service (from the Offerings list)
   - Desired Date
   - Preferred Time
5. THE HANDSHAKE: Only once every detail is secured, summarize the booking elegantly and append the system marker:
   EXTRACTED_DATA: {"name": "...", "service": "...", "date": "...", "time": "..."}

CONSTRAINTS:
- Never reveal you are an AI unless explicitly asked, and even then, do so with style ("I am Nexa, your digital concierge").
- If details are missing, ask for them one or two at a time—do not overwhelm the guest.
- Stay strictly within the persona of a high-end business assistant.`;
};

async function processMessage(message, history = [], context = {}, audioBuffer = null, mimeType = null) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: generateSystemPrompt(context)
    });
    
    let contentParts = [{ text: message || "I have sent a voice message." }];
    
    if (audioBuffer && mimeType) {
      contentParts.push({
        inlineData: {
          data: audioBuffer.toString("base64"),
          mimeType: mimeType
        }
      });
    }

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(contentParts);
    const response = await result.response;
    const text = response.text();
    
    // ... rest of the extraction logic ...

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
