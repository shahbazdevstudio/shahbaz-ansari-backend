import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, me, updateCredentials } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, try again later" },
});

router.post("/login", loginLimiter, login);
router.get("/me", protect, me);
router.put("/credentials", protect, updateCredentials);

export default router;
