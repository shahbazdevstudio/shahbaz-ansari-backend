import { env } from "../config/env.js";

export const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Not found: ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || "Server error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  } else if (err.code === "LIMIT_FILE_SIZE") {
    status = 400;
    message = "Image too large (max 5MB)";
  }
  if (status === 500) console.error(err);

  res.status(status).json({
    success: false,
    message: status === 500 && env.isProd ? "Server error" : message,
  });
};
