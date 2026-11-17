import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

app.listen(env.port, () => console.log(`API running on http://localhost:${env.port}`));

// Try to connect on boot; the server stays up either way and retries on the next request.
connectDB()
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("\n[!] MongoDB not connected:", err.message, "\n    Run `npm run check-db` for a step-by-step diagnosis.\n"));
