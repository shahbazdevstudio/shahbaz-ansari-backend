import { connectDB } from "../config/db.js";

// Ensures a DB connection exists before every request (needed on serverless).
export const ensureDB = async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    next(e);
  }
};
