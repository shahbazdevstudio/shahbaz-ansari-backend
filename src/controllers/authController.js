import Admin from "../models/Admin.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { signToken, normalizeLogin } from "../utils/token.js";

// Creates the first admin from .env if none exists yet.
async function bootstrapAdmin() {
  if ((await Admin.countDocuments()) > 0) return;
  if (!env.adminEmail || !env.adminPassword) return;
  await Admin.create({
    email: normalizeLogin(env.adminEmail),
    password: env.adminPassword,
  });
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, "Email and password are required");

  await bootstrapAdmin();

  const admin = await Admin.findOne({ email: normalizeLogin(email) }).select("+password");
  if (!admin || !(await admin.matchPassword(String(password)))) {
    throw new HttpError(401, "Invalid email or password");
  }
  res.json({ success: true, token: signToken(admin._id), email: admin.email });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, email: req.admin.email });
});

// Change login email and/or password (current password required)
export const updateCredentials = asyncHandler(async (req, res) => {
  const { currentPassword, email, newPassword } = req.body;
  if (!currentPassword) throw new HttpError(400, "Current password is required");

  const admin = await Admin.findById(req.admin._id).select("+password");
  if (!(await admin.matchPassword(String(currentPassword)))) {
    throw new HttpError(401, "Current password is incorrect");
  }

  if (email) {
    const normalized = normalizeLogin(email);
    if (normalized.length < 3) throw new HttpError(400, "Email is too short");
    const clash = await Admin.findOne({ email: normalized, _id: { $ne: admin._id } });
    if (clash) throw new HttpError(400, "That email is already in use");
    admin.email = normalized;
  }
  if (newPassword) {
    if (String(newPassword).length < 8) {
      throw new HttpError(400, "New password must be at least 8 characters");
    }
    admin.password = String(newPassword);
  }
  await admin.save();
  res.json({ success: true, email: admin.email, token: signToken(admin._id) });
});
