import { Router } from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { protect } from "../middleware/auth.js";
import { imageUpload } from "../middleware/upload.js";

const router = Router();

router.post("/", protect, imageUpload.single("image"), uploadImage);

export default router;
