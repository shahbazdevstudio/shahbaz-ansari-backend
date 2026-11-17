import cloudinary from "../config/cloudinary.js";
import { HttpError } from "./httpError.js";

// Cloudinary rejects with plain objects ({ message, http_code }), so turn them into readable errors.
function toHttpError(err) {
  const code = err?.http_code || err?.status;
  const msg = err?.message || "Upload failed";
  if (code === 401 || /invalid (api[_ ]key|signature)|unauthorized/i.test(msg)) {
    return new HttpError(502, "Cloudinary rejected the credentials. Check CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET.");
  }
  if (code === 403 || /UnexpectedResponse/i.test(err?.name || "")) {
    return new HttpError(
      502,
      "Cloudinary refused the upload (403). Check that the API key is active and not restricted, the account is not suspended, " +
        "and the cloud name is correct. Run `npm run check-cloudinary` in the backend for the exact reason."
    );
  }
  return new HttpError(502, `Image upload failed: ${msg}`);
}

export function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `portfolio/${folder}`, resource_type: "image" },
      (err, result) => (err ? reject(toHttpError(err)) : resolve(result))
    );
    stream.on("error", (e) => reject(toHttpError(e)));
    stream.end(buffer);
  });
}

export async function deleteImage(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    console.warn("Cloudinary delete failed:", e.message);
  }
}
