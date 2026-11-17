import { Router } from "express";
import { importContent } from "../controllers/seedController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.post("/", protect, importContent);

export default router;
