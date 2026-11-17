import { verifyToken } from "../utils/token.js";
import Admin from "../models/Admin.js";
import { HttpError } from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "Not authorized");

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new HttpError(401, "Session expired, please log in again");
  }
  const admin = await Admin.findById(payload.id);
  if (!admin) throw new HttpError(401, "Not authorized");
  req.admin = admin;
  next();
});
