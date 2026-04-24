const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const { processMessage, textToSpeech } = require("./aiService");
const { db, admin } = require("./firebaseAdmin");
const qrcode = require("qrcode");
const { createCalendarEvent, isSlotAvailable } = require("./calendarService");

class ClientManager {
  constructor() {
    this.clients = new Map();
    this.io = null;
  }

  setIo(io) {
    this.io = io;
  }

  async initClient(userId) {
    if (this.clients.has(userId)) {
      console.log(`Client already exists for user: ${userId}`);
      return;
    }

    console.log(`Initializing WhatsApp client for user: ${userId}`);
    
    const client = new Client({
      authStrategy: new LocalAuth({ 
        clientId: userId,
        dataPath: './sessions'
      }),
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu"
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
      },
    });

    this.clients.set(userId, client);

    client.on("qr", async (qr) => {
      console.log(`QR received for user: ${userId}`);
      try {
        const qrDataUrl = await qrcode.toDataURL(qr);
        if (this.io) {
          this.io.to(userId).emit("qr", qrDataUrl);
        }
      } catch (err) {
        console.error("Error generating QR data URL:", err);
      }
    });

    client.on("ready", async () => {
      console.log(`WhatsApp client ready for user: ${userId}`);
      
      // Mark as connected in DB for cold-start tracking
      await db.collection("users").doc(userId).set({
        whatsappConnected: true,
        lastOnline: new Date().toISOString()
      }, { merge: true });

      if (this.io) {
        this.io.to(userId).emit("status", "ready");
      }
    });

    client.on("authenticated", () => {
      console.log(`WhatsApp client authenticated for user: ${userId}`);
      if (this.io) {
        this.io.to(userId).emit("status", "authenticated");
      }
    });

    client.on("auth_failure", (msg) => {
      console.error(`Auth failure for user: ${userId}`, msg);
      if (this.io) {
        this.io.to(userId).emit("status", "auth_failure");
      }
    });

    client.on("message", async (msg) => {
      // Only respond to personal chats (not groups)
      if (msg.from.includes("@g.us")) return;

      console.log(`Message received from ${msg.from} for user ${userId}`);

      // Handle the message with AI
      try {
        // 1. Check Subscription Status & Booking Limits
        const [userDoc, appointmentsSnap] = await Promise.all([
          db.collection("users").doc(userId).get(),
          db.collection("appointments").where("userId", "==", userId).get()
        ]);

        const userData = userDoc.data() || {};
        const isPro = userData.subscription?.status === 'active';
        const bookingCount = appointmentsSnap.size;
        const FREE_LIMIT = 3;

        // 2. Enforce Free Tier Limits (3 Bookings)
        if (!isPro && bookingCount >= FREE_LIMIT) {
          console.log(`[${userId}] Free limit reached. Sending upgrade notice.`);
          await msg.reply("This business assistant has reached its free booking limit. Please contact the business owner to upgrade their service!");
          return; 
        }

        let audioBuffer = null;
        let mimeType = null;
        let isVoiceInput = false;

        if (msg.hasMedia) {
          const media = await msg.downloadMedia();
          if (media.mimetype.includes("audio")) {
            // Voice processing is premium or requested by user
            audioBuffer = Buffer.from(media.data, "base64");
            mimeType = media.mimetype;
            isVoiceInput = true;
            console.log(`Audio media received from ${msg.from}`);
          }
        }

        // Fetch business settings for context
        const settingsSnap = await db.collection("botSettings").doc(userId).get();
        const businessContext = settingsSnap.exists() ? settingsSnap.data() : {};

        // Fetch recent chat history for context
        const chat = await msg.getChat();
        const recentMessages = await chat.fetchMessages({ limit: 6 });
        
        const history = recentMessages
          .filter(m => m.id.id !== msg.id.id) // Exclude the current message
          .map(m => ({
            role: m.fromMe ? "model" : "user",
            parts: [{ text: m.body || (m.hasMedia ? "[Media/Voice]" : "") }]
          }));

        const aiResponse = await processMessage(msg.body, history, businessContext, audioBuffer, mimeType);
        
        // Helper to send reply (Voice or Text)
        const sendReply = async (text) => {
          if (isVoiceInput) {
            const voiceBase64 = await textToSpeech(text);
            if (voiceBase64) {
              const audioMedia = new MessageMedia("audio/ogg; codecs=opus", voiceBase64);
              await client.sendMessage(msg.from, audioMedia, { sendAudioAsVoice: true });
              return;
            }
          }
          await msg.reply(text);
        };

        if (aiResponse.extractedData) {
          // Check Google Calendar Availability
          const isAvailable = await isSlotAvailable(userId, aiResponse.extractedData.date, aiResponse.extractedData.time);
          
          if (!isAvailable) {
            const conflictReply = "I'm sorry, but that time slot has just been taken. Could you please suggest another time or date?";
            await sendReply(conflictReply);
            return;
          }

          // Create appointment
          const appointmentData = {
            userId: userId,
            customerName: aiResponse.extractedData.name,
            service: aiResponse.extractedData.service,
            date: aiResponse.extractedData.date,
            time: aiResponse.extractedData.time,
            status: "confirmed", 
            customerPhone: msg.from,
            reminded: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          await db.collection("appointments").add(appointmentData);

          // Sync to Google Calendar
          createCalendarEvent(userId, appointmentData).catch(e => console.error("Auto-sync failed:", e));
          
          await sendReply(aiResponse.reply);
        } else {
          await sendReply(aiResponse.reply);
        }
      } catch (error) {
        console.error("Error processing message with AI:", error);
      }
    });

    client.initialize().catch(err => {
      console.error(`Failed to initialize client for user ${userId}:`, err);
    });
  }

  async getClientStatus(userId) {
    const client = this.clients.get(userId);
    if (!client) return "disconnected";
    
    try {
      // Use a timeout to prevent hanging if the client is not responding
      const statePromise = client.getState();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      );
      
      const state = await Promise.race([statePromise, timeoutPromise]);
      return state ? state.toLowerCase() : "initializing";
    } catch (e) {
      console.log(`Status check for ${userId}: ${e.message}`);
      return "initializing";
    }
  }

  async restartClient(userId) {
    const client = this.clients.get(userId);
    if (client) {
      await client.destroy();
      this.clients.delete(userId);
    }
    await this.initClient(userId);
  }

  async startAllClients() {
    console.log("Cold Start Optimization disabled to save server resources.");
  }
}

module.exports = new ClientManager();
