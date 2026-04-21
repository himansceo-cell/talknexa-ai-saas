const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const clientManager = require("./services/clientManager");
const { db, auth } = require("./services/firebaseAdmin");
const { getAssistantResponse } = require("./services/aiAssistant");
const { getRecentPayments } = require("./services/paymentService");
const { initReminderService } = require("./services/reminderService");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

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
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Health Check for Deployment
app.get("/health", (req, res) => {
  res.status(200).send("OK");
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
  try {
    await clientManager.initClient(req.user.uid);
    res.json({ status: "initializing" });
  } catch (error) {
    res.status(500).json({ error: "Failed to start WhatsApp session" });
  }
});

// Get WhatsApp Status
app.get("/api/whatsapp/status", authenticate, async (req, res) => {
  const status = await clientManager.getClientStatus(req.user.uid);
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

// AI Assistant Chat
app.post("/api/assistant/chat", authenticate, async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    const response = await getAssistantResponse(req.user.uid, message, chatHistory);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payments Stats Route
app.get("/api/payments/stats", authenticate, async (req, res) => {
  try {
    const payments = await getRecentPayments(50);
    const totalRevenue = payments
      .filter(p => p.paymentStatus === "paid")
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalRevenue,
      recentPayments: payments.slice(0, 5),
      paymentCount: payments.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize Automated Services
initReminderService();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
