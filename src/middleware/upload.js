import multer from "multer";
import { HttpError } from "../utils/httpError.js";

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    /^image\/(png|jpe?g|webp|gif|avif)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(new HttpError(400, "Only PNG, JPG, WEBP, GIF or AVIF images are allowed")),
});
