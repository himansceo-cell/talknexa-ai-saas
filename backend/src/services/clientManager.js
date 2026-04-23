const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const { processMessage } = require("./aiService");
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
      authStrategy: new LocalAuth({ clientId: userId }),
      puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
        const FREE_LIMIT = 5;

        // 2. Enforce Free Tier Limits
        if (!isPro && bookingCount >= FREE_LIMIT) {
          console.log(`[${userId}] Free limit reached. Skipping AI response.`);
          return; 
        }

        let audioBuffer = null;
        let mimeType = null;

        if (msg.hasMedia) {
          const media = await msg.downloadMedia();
          if (media.mimetype.includes("audio")) {
            // Block voice for non-pro
            if (!isPro) {
              await msg.reply("I've received your voice note, but advanced voice processing is a Pro feature. Please type your request!");
              return;
            }
            audioBuffer = Buffer.from(media.data, "base64");
            mimeType = media.mimetype;
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
            parts: [{ text: m.body }]
          }));

        const aiResponse = await processMessage(msg.body, history, businessContext, audioBuffer, mimeType);
        
        if (aiResponse.extractedData) {
          // 0. Check Google Calendar Availability (Conflict Prevention)
          const isAvailable = await isSlotAvailable(userId, aiResponse.extractedData.date, aiResponse.extractedData.time);
          
          if (!isAvailable) {
            const conflictReply = "I'm sorry, but that time slot has just been taken. Could you please suggest another time or date?";
            await msg.reply(conflictReply);
            
            // Send voice for conflict too
            if (process.env.ELEVENLABS_API_KEY) {
              const audioBase64 = await textToSpeech(conflictReply);
              if (audioBase64) {
                const media = new MessageMedia("audio/mpeg", audioBase64);
                await client.sendMessage(msg.from, media, { sendAudioAsVoice: true });
              }
            }
            return;
          }

          // 1. Generate Payment Link
          const depositAmount = businessContext.depositAmount || 20; // Default $20
          const paymentLink = await createPaymentLink(
            aiResponse.extractedData.name,
            aiResponse.extractedData.service,
            depositAmount
          );

          // 2. Save appointment as pending
          const appointment = {
            userId: userId,
            customerName: aiResponse.extractedData.name,
            service: aiResponse.extractedData.service,
            date: aiResponse.extractedData.date,
            time: aiResponse.extractedData.time,
            status: paymentLink ? "pending_payment" : "confirmed", 
            customerPhone: msg.from,
            reminded: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          await db.collection("appointments").add(appointment);
          
          // 3. Try to sync to Google Calendar (if linked)
          createCalendarEvent(userId, appointment).catch(e => console.error("Auto-sync failed:", e));
          
          let finalReply = aiResponse.reply;
          if (paymentLink) {
            finalReply += `\n\n💳 *To finalize your booking, please complete the $${depositAmount} deposit here:* ${paymentLink}\n\n_Your slot is reserved for the next 15 minutes._`;
          }

          await msg.reply(finalReply);
        } else {
          // Information still missing, send AI follow-up
          await msg.reply(aiResponse.reply);
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
    console.log("🚀 Starting Cold Start Optimization: Re-initializing all active sessions...");
    try {
      const snapshot = await db.collection("users").get();
      const authenticatedUsers = snapshot.docs
        .filter(doc => doc.data().whatsappConnected) // We should mark this on 'ready'
        .map(doc => doc.id);

      console.log(`Found ${authenticatedUsers.length} previously connected users.`);
      
      // Initialize them sequentially to avoid CPU spikes
      for (const userId of authenticatedUsers) {
        await this.initClient(userId);
        // Small delay between initializations
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error("Cold Start Optimization Failed:", error);
    }
  }
}

module.exports = new ClientManager();
