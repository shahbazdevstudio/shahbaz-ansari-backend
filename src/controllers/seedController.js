import { asyncHandler } from "../utils/asyncHandler.js";
import { importDefaults } from "../utils/seedData.js";

// Admin button: "Import existing website content"
export const importContent = asyncHandler(async (_req, res) => {
  const result = await importDefaults();
  res.json({ success: true, ...result });
});
