import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { uploadBuffer } from "../utils/cloudinaryHelpers.js";

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, "No image provided");
  const folder = req.query.folder === "testimonials" ? "testimonials" : "projects";
  const result = await uploadBuffer(req.file.buffer, folder);
  res.status(201).json({
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
  });
});
