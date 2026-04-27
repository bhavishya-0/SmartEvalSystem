import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import authRoutes from "./routes/auth.routes";
import assignmentsRoutes from "./routes/assignments.routes";
import evaluationsRoutes from "./routes/evaluations.routes";
import reportsRoutes from "./routes/reports.routes";
import studentsRoutes from "./routes/students.routes";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "..", "public")));

// ── MongoDB Connection (lazy - connect on first API call) ────────────────────
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart-eval";
let mongoConnected = false;

const connectMongoDB = async () => {
  if (mongoConnected || mongoose.connection.readyState === 1) {
    mongoConnected = true;
    return;
  }
  
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    mongoConnected = true;
    console.log(`✅ MongoDB connected`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    mongoConnected = false;
  }
};

// Middleware to ensure MongoDB is connected before API calls
app.use("/api/", async (req, res, next) => {
  try {
    await connectMongoDB();
    next();
  } catch (error) {
    res.status(500).json({ message: "Database connection failed" });
  }
});

// ── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/evaluations", evaluationsRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    db: mongoConnected ? "connected" : "disconnected" 
  });
});

// ── SPA Fallback Route ──────────────────────────────────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// ── Global error handler ────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

// ── Export for Vercel (serverless) ──────────────────────────────────────────
export default app;

// ── Local development server ────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`MongoDB will connect on first API call to: ${MONGO_URI}`);
  });
}

// ── Handle unhandled rejections ─────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
