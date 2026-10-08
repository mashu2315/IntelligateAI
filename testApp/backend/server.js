import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { AppProfile, Order } from "./models.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to TestApp's independent database
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/testapp_business_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log(`✅ TestApp Database Connected`))
  .catch(err => console.error('TestApp DB Error:', err));


// ==========================================
// DEMO ENDPOINTS (For Gateway features)
// ==========================================
app.get("/api/secure-data", (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: Missing x-user-id header from Gateway" });
  }
  
  setTimeout(() => {
    res.json({
      message: "Secure Data Accessed",
      userId: userId,
      serverTime: Date.now()
    });
  }, 2000);
});

app.get("/api/admin-data", (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  res.json({ message: "Super Secret Admin Data Accessed!", userId, serverTime: Date.now() });
});

app.get("/api/products", (req, res) => {
  res.json({
    message: "Products List",
    products: [{ id: 1, name: "Laptop", price: 1000 }, { id: 2, name: "Phone", price: 500 }],
    serverTime: Date.now(),
    query: req.query 
  });
});

app.get("/api/fast-data", (req, res) => {
  res.json({ message: "Fast Response", serverTime: Date.now() });
});


// ==========================================
// BUSINESS LOGIC ENDPOINTS (Following Professor's Architecture)
// ==========================================

// 1. Get Application Profile
app.get("/api/profile", async (req, res) => {
  const userId = req.headers["x-user-id"]; // Injected by IntelliGate!
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  let profile = await AppProfile.findOne({ userId });
  if (!profile) {
    profile = await AppProfile.create({ userId, loyaltyPoints: 100 });
  }
  res.json({ success: true, profile });
});

// 2. Update Application Profile (Address, preferences, etc.)
app.put("/api/profile", async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { address, preferences } = req.body;
  const profile = await AppProfile.findOneAndUpdate(
    { userId }, 
    { address, preferences }, 
    { new: true, upsert: true }
  );
  res.json({ success: true, profile });
});

// 3. Create an Order
app.post("/api/orders", async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { products, totalAmount } = req.body;
  const order = await Order.create({ userId, products, totalAmount });
  res.status(201).json({ success: true, order });
});

// 4. Get User's Orders
app.get("/api/orders", async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Target Backend running on http://localhost:${PORT}`);
});
