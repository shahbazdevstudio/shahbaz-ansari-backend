// Usage: npm run check-cloudinary — shows Cloudinary's REAL response for a test upload.
import cloudinary from "../config/cloudinary.js";
import { env } from "../config/env.js";

const { cloud_name, api_key, api_secret } = env.cloudinary;
console.log("cloud_name:", cloud_name, "| api_key:", api_key, "| secret length:", (api_secret || "").length);
if (!cloud_name || !api_key || !api_secret) {
  console.log("A CLOUDINARY_* value is missing in .env");
  process.exit(1);
}

// 1x1 transparent PNG
const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const timestamp = Math.floor(Date.now() / 1000);
const folder = "portfolio/test";
const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, api_secret);

const body = new URLSearchParams({ file: png, api_key, timestamp: String(timestamp), folder, signature });

try {
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, { method: "POST", body });
  const text = await res.text();
  console.log("\nHTTP status:", res.status);
  console.log("Response   :", text.slice(0, 600));
  if (res.ok) console.log("\nOK — uploads work. If the admin panel still fails, tell me the new error.");
  else console.log("\nSend this output to the developer — the message above is Cloudinary's exact reason.");
} catch (e) {
  console.log("\nCould not reach api.cloudinary.com:", e.message);
  console.log("Network/ISP/VPN/firewall is blocking it — try another network or a VPN.");
}
process.exit(0);
