import "dotenv/config";

export const env = {
  port: process.env.PORT || 5000,
  isProd: process.env.NODE_ENV === "production",
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  siteUrl: (process.env.SITE_URL || "https://www.shahbazansari.pro").replace(/\/$/, ""),
  clientOrigins: (process.env.CLIENT_URL || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean),
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
};
