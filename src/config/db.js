import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";
import { HttpError } from "../utils/httpError.js";

// Some networks/ISPs can't resolve mongodb+srv:// records. Set DNS_SERVERS=8.8.8.8,1.1.1.1 in .env to fix.
if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(",").map((s) => s.trim()));
}

// Cache the connection so serverless invocations (Vercel) reuse it.
let cached = globalThis.__mongoose;
if (!cached) cached = globalThis.__mongoose = { conn: null, promise: null };

function explain(err) {
  const msg = String(err?.message || err);
  if (/whitelist|not allowed|Could not connect to any servers|ReplicaSetNoPrimary|ETIMEDOUT|ServerSelection/i.test(msg)) {
    return "Cannot reach MongoDB Atlas. In Atlas → Network Access, add 0.0.0.0/0 (Allow access from anywhere). " +
      "A single IP is not enough on Vercel because its servers use changing IPs (and home IPs change too).";
  }
  if (/bad auth|Authentication failed/i.test(msg)) {
    return "MongoDB login failed. Check the database user and password in MONGODB_URI (special characters in the password must be URL-encoded).";
  }
  if (/querySrv|ENOTFOUND|ECONNREFUSED/i.test(msg)) {
    return "DNS lookup for the MongoDB cluster failed. Check the cluster address in MONGODB_URI, your internet connection, or set DNS_SERVERS=8.8.8.8,1.1.1.1 in .env.";
  }
  return `MongoDB connection error: ${msg}`;
}

export async function connectDB() {
  if (!env.mongoUri) throw new HttpError(500, "MONGODB_URI is not set in the environment variables");
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(env.mongoUri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 10, bufferCommands: false })
      .then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("[db]", e.message);
    throw new HttpError(503, explain(e));
  }
  return cached.conn;
}
