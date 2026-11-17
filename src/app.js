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

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin / curl and any whitelisted frontend
      if (!origin || env.clientOrigins.includes(origin)) return cb(null, true);
      if (!env.isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
      cb(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => res.json({ success: true, message: "Portfolio API is running" }));
app.get("/api/health", (_req, res) => res.json({ success: true }));

app.use(ensureDB);
app.use("/api", apiRoutes);
app.use(seoRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
