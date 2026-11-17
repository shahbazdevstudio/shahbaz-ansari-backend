// Usage: npm run seed   (safe to re-run — only fills empty collections)
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";
import { env } from "../config/env.js";
import { normalizeLogin } from "../utils/token.js";
import { importDefaults } from "../utils/seedData.js";

try {
  await connectDB();
  const r = await importDefaults();
  console.log(`Imported ${r.projects} projects, ${r.testimonials} testimonials (0 = collection already had data)`);
  if ((await Admin.countDocuments()) === 0 && env.adminEmail && env.adminPassword) {
    await Admin.create({ email: normalizeLogin(env.adminEmail), password: env.adminPassword });
    console.log("Admin account created from .env");
  }
  process.exit(0);
} catch (e) {
  console.error("\n" + e.message + "\n");
  process.exit(1);
}
