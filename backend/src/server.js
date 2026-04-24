const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const http = require("http");
const { Server } = require("socket.io");
const { google } = require("googleapis");
const cors = require("cors");
require("dotenv").config();

const clientManager = require("./services/clientManager");
const { db, auth } = require("./services/firebaseAdmin");
const { getAssistantResponse } = require("./services/aiAssistant");
const { processMessage } = require("./services/aiService");
const { initReminderService } = require("./services/reminderService");
const { createCheckoutSession, createPortalSession } = require("./services/billingService");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://talknexa09.pages.dev", "https://a2f99da3.talknexa09.pages.dev", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());

// Stripe Webhook needs raw body
app.post("/api/webhook/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook Signature Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      
      // Handle Subscription Upgrade
      if (session.mode === "subscription") {
        const userId = session.metadata.firebaseUID;
        if (userId) {
          await db.collection("users").doc(userId).set({
            subscription: {
              status: "active",
              plan: "Professional",
              updatedAt: new Date().toISOString(),
              stripeSubscriptionId: session.subscription
            }
          }, { merge: true });
          console.log(`User ${userId} upgraded to Pro!`);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      const userId = customer.metadata.firebaseUID;
      if (userId) {
        await db.collection("users").doc(userId).set({
          subscription: {
            status: "expired",
            plan: "Community",
            updatedAt: new Date().toISOString()
          }
        }, { merge: true });
        console.log(`User ${userId} subscription cancelled/expired.`);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      const userId = customer.metadata.firebaseUID;
      if (userId) {
        await db.collection("users").doc(userId).set({
          subscription: {
            status: subscription.status === 'active' ? 'active' : 'past_due',
            updatedAt: new Date().toISOString()
          }
        }, { merge: true });
      }
      break;
    }
  }

  res.json({ received: true });
});

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "TalkNexa AI Backend is Live",
    timestamp: new Date().toISOString()
  });
});

// Health Check for Render/UptimeRobot
app.get("/health", (req, res) => {
  res.status(200).send("TalkNexa Backend is Operational");
});

// Socket.io connection logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Pass io to client manager
clientManager.setIo(io);

// Middleware to verify Firebase token
const authenticate = async (req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    console.log(`Request authenticated for user: ${req.user.uid}`);
    next();
  } catch (error) {
    if (error.code === 'auth/id-token-audience-mismatch' || error.message.includes('aud')) {
      console.error("\n❌ PROJECT MISMATCH DETECTED!");
      console.error(`Backend project: ${admin.app().options.credential.projectId || 'Unknown'}`);
      console.error(`Token project (aud): ${error.message.match(/got "(.*?)"/)?.[1] || 'Unknown'}\n`);
    }
    console.error("Authentication error:", error.message);
    res.status(401).json({ error: "Unauthorized", code: error.code });
  }
};

// Health Check for Deployment
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is reachable" });
});

// --- API Routes ---

// Get User's Appointments
app.get("/api/appointments", authenticate, async (req, res) => {
  try {
    const snapshot = await db.collection("appointments")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();
    
    const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Delete Appointment (Extra feature but useful)
app.delete("/api/appointments/:id", authenticate, async (req, res) => {
  try {
    await db.collection("appointments").doc(req.params.id).delete();
    res.json({ message: "Appointment deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

// Start WhatsApp Session
app.post("/api/whatsapp/start", authenticate, async (req, res) => {
  console.log(`Received WhatsApp start request for user: ${req.user.uid}`);
  try {
    await clientManager.initClient(req.user.uid);
    res.json({ status: "initializing" });
  } catch (error) {
    console.error(`Error starting WhatsApp session for user ${req.user.uid}:`, error);
    res.status(500).json({ error: "Failed to start WhatsApp session" });
  }
});

// Get WhatsApp Status
app.get("/api/whatsapp/status", authenticate, async (req, res) => {
  console.log(`Received WhatsApp status request for user: ${req.user.uid}`);
  const status = await clientManager.getClientStatus(req.user.uid);
  console.log(`Returning status for user ${req.user.uid}: ${status}`);
  res.json({ status });
});

// Restart WhatsApp Session (In case of issues)
app.post("/api/whatsapp/restart", authenticate, async (req, res) => {
  try {
    await clientManager.restartClient(req.user.uid);
    res.json({ status: "restarting" });
  } catch (error) {
    res.status(500).json({ error: "Failed to restart WhatsApp session" });
  }
});

// Business Analytics
app.get("/api/analytics", authenticate, async (req, res) => {
  try {
    const snapshot = await db.collection("appointments")
      .where("userId", "==", req.user.uid)
      .get();
    
    const stats = {
      totalBookings: snapshot.size,
      servicePopularity: {},
      weeklyBookings: Array(7).fill(0), // Placeholder for actual time-series logic
    };

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      stats.servicePopularity[data.service] = (stats.servicePopularity[data.service] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// AI Assistant Chat (For Business Owner)
app.post("/api/assistant/chat", authenticate, async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    const response = await getAssistantResponse(req.user.uid, message, chatHistory);
    res.json(response);
  } catch (error) {
    console.error("Assistant Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Bot Persona Test (For Customers Simulation)
app.post("/api/bot/test", authenticate, async (req, res) => {
  try {
    const { message, history, context } = req.body;
    // We use the provided context so user can test BEFORE saving
    const response = await processMessage(message, history, context);
    res.json(response);
  } catch (error) {
    console.error("Bot Test Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize Automated Services
initReminderService();

// --- Billing Routes ---

app.post("/api/billing/create-checkout", authenticate, async (req, res) => {
  try {
    const url = await createCheckoutSession(req.user.uid, req.user.email);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/billing/customer-portal", authenticate, async (req, res) => {
  try {
    const url = await createPortalSession(req.user.uid);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Google Calendar OAuth ---

app.get("/api/auth/google/url", authenticate, (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.readonly"],
    state: req.user.uid,
    prompt: "consent"
  });

  res.json({ url });
});

app.get("/api/auth/google/callback", async (req, res) => {
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    return res.status(400).send("Missing code or state");
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    await db.collection("users").doc(userId).set({
      googleToken: tokens,
      calendarConnected: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.redirect(`${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/dashboard?calendar=success`);
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    res.redirect(`${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/dashboard?calendar=error`);
  }
});

const PORT = process.env.PORT || 3001;

// Global error handlers for production debugging
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start clients in the background to avoid blocking the main thread during startup
  clientManager.startAllClients().catch(err => {
    console.error("Error starting WhatsApp clients:", err);
  });
});
