
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import { env } from "./config/env.js";
import { ensureDB } from "./middleware/db.js";
import { notFound, errorHandler } from "./middleware/error.js";
import apiRoutes from "./routes/index.js";
import seoRoutes from "./routes/seoRoutes.js";

const app = express();

// Security & Proxy
app.disable("x-powered-by");
app.set("trust proxy", 1);

// Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// Compression
app.use(compression());

// CORS - Allow requests from all origins
app.use(cors());

// Body Parser
app.use(express.json({ limit: "1mb" }));

// Root Route
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Portfolio API is running",
  });
});

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
  });
});

// Database Middleware
app.use(ensureDB);

// API Routes
app.use("/api", apiRoutes);

// SEO Routes
app.use(seoRoutes);

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;
