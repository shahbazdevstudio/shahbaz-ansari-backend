import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signToken = (id) =>
  jwt.sign({ id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

// Login ids are case-insensitive and ignore spaces ("Shehbaz Ansari.dev" === "shehbazansari.dev")
export const normalizeLogin = (v = "") => String(v).replace(/\s+/g, "").toLowerCase();
