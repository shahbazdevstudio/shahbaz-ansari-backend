// Sets (or resets) the admin login directly in the database.
//
//   npm run admin:reset -- "your-email" "your-password"
//   npm run admin:reset            (uses ADMIN_EMAIL / ADMIN_PASSWORD from .env)
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";
import { env } from "../config/env.js";
import { normalizeLogin } from "../utils/token.js";

const [, , argEmail, argPassword] = process.argv;
const email = argEmail || env.adminEmail;
const password = argPassword || env.adminPassword;

if (!email || !password) {
  console.error('Usage: npm run admin:reset -- "email" "password"');
  process.exit(1);
}

try {
  await connectDB();
  await Admin.deleteMany({});
  await Admin.create({ email: normalizeLogin(email), password });
  console.log("\nAdmin saved in database.");
  console.log("  Login ID :", normalizeLogin(email), "(case & spaces ignored)");
  console.log("  Password :", password, "\n");
  process.exit(0);
} catch (e) {
  console.error("\n" + e.message + "\n");
  process.exit(1);
}
