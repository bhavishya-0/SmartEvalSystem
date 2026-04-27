import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import authRoutes from "../src/routes/auth.routes";
import assignmentsRoutes from "../src/routes/assignments.routes";
import evaluationsRoutes from "../src/routes/evaluations.routes";
import reportsRoutes from "../src/routes/reports.routes";
import studentsRoutes from "../src/routes/students.routes";

dotenv.config();

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// ── MongoDB Connection (lazy) ─────────────────────────────────────────────────
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart-eval";
let mongoConnected = false;

const connectMongoDB = async () => {
  if (mongoConnected || mongoose.connection.readyState === 1) {
    mongoConnected = true;
    return;
  }
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    mongoConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    mongoConnected = false;
    throw error;
  }
};

// ── Health check — MUST be before DB middleware so it always responds ─────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    db: mongoConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// ── DB middleware for all /api routes ────────────────────────────────────────
app.use("/api/", async (_req, res, next) => {
  try {
    await connectMongoDB();
    next();
  } catch (error) {
    res.status(500).json({ message: "Database connection failed", error: String(error) });
  }
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/evaluations", evaluationsRoutes);
app.use("/api/reports", reportsRoutes);

// ── Serve static files (fallback for non-Vercel static route) ────────────────
const publicDir = path.resolve(process.cwd(), "public");
app.use(express.static(publicDir, { maxAge: "1d", etag: false }));

// ── SPA fallback ─────────────────────────────────────────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

// ── Export for Vercel serverless ──────────────────────────────────────────────
module.exports = app;
export default app;
