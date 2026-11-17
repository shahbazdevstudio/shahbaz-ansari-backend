// Usage: npm run check-db — finds out WHY the MongoDB connection fails.
import dns from "node:dns/promises";
import net from "node:net";
import { env } from "../config/env.js";

const uri = env.mongoUri || "";
const host = (uri.match(/@([^/?]+)/) || [])[1];
if (!host) { console.log("MONGODB_URI is missing or malformed in .env"); process.exit(1); }

const tcp = (h, port) =>
  new Promise((resolve) => {
    const s = net.connect({ host: h, port, timeout: 6000 });
    s.on("connect", () => { s.destroy(); resolve(true); });
    s.on("timeout", () => { s.destroy(); resolve(false); });
    s.on("error", () => resolve(false));
  });

console.log("Cluster host:", host);
let targets = [];
try {
  if (uri.startsWith("mongodb+srv")) {
    const srv = await dns.resolveSrv(`_mongodb._tcp.${host}`);
    targets = srv.map((r) => ({ host: r.name, port: r.port }));
    console.log("1) DNS (SRV) lookup .......... OK ->", targets.map((t) => t.host).join(", "));
  } else {
    targets = host.split(",").map((h) => ({ host: h.split(":")[0], port: Number(h.split(":")[1] || 27017) }));
  }
} catch (e) {
  console.log("1) DNS (SRV) lookup .......... FAILED:", e.code || e.message);
  console.log("   -> Your DNS/ISP can't resolve Atlas. Add DNS_SERVERS=8.8.8.8,1.1.1.1 to .env, or switch the PC's DNS to 8.8.8.8, or try a VPN / mobile hotspot.");
  process.exit(1);
}

let ok = 0;
for (const t of targets) {
  const up = await tcp(t.host, t.port);
  console.log(`2) TCP ${t.host}:${t.port} .......... ${up ? "OK" : "BLOCKED / TIMEOUT"}`);
  if (up) ok++;
}
if (!ok) {
  console.log("\nThe network path to Atlas is blocked from this computer (ISP/firewall/antivirus/VPN). Try a mobile hotspot or a VPN, or allow port 27017 outbound.");
} else {
  console.log("\nNetwork is fine. If the app still can't connect, the reason is Atlas itself:");
  console.log(" - Atlas > Network Access: 0.0.0.0/0 must be listed and Active (not 'Pending')");
  console.log(" - Atlas > Database: the cluster must not be Paused");
  console.log(" - Atlas > Database Access: the user/password in MONGODB_URI must match (URL-encode special characters)");
}
process.exit(0);
