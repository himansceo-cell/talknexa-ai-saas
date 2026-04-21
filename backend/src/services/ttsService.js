const axios = require("axios");

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL"; // Default "Bella" or a premium voice

const textToSpeech = async (text) => {
  if (!ELEVENLABS_API_KEY) {
    console.warn("ElevenLabs API Key missing. Skipping TTS.");
    return null;
  }

  try {
    const response = await axios({
      method: "post",
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      data: {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      headers: {
        Accept: "audio/mpeg",
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    });

    return Buffer.from(response.data).toString("base64");
  } catch (error) {
    console.error("ElevenLabs TTS Error:", error.response?.data || error.message);
    return null;
  }
};

module.exports = { textToSpeech };
