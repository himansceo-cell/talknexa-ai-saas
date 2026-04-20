const { Client, LocalAuth } = require("whatsapp-web.js");
const { processMessage } = require("./aiService");
const { db, admin } = require("./firebaseAdmin");
const qrcode = require("qrcode");

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

    client.on("ready", () => {
      console.log(`WhatsApp client ready for user: ${userId}`);
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
        // Simple context management (for MVP we can store in memory or Firestore)
        // For now, let's just pass the message
        const aiResponse = await processMessage(msg.body);
        
        if (aiResponse.extractedData) {
          // All fields collected! Save to Firestore
          const appointment = {
            userId: userId,
            customerName: aiResponse.extractedData.name,
            service: aiResponse.extractedData.service,
            date: aiResponse.extractedData.date,
            time: aiResponse.extractedData.time,
            status: "confirmed",
            customerPhone: msg.from,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          await db.collection("appointments").add(appointment);
          
          await msg.reply(aiResponse.reply || "Your appointment is confirmed ✅");
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
      const state = await client.getState();
      return state.toLowerCase();
    } catch (e) {
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
}

module.exports = new ClientManager();
