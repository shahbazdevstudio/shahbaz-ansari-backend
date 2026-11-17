import { Router } from "express";
import authRoutes from "./authRoutes.js";
import projectRoutes from "./projectRoutes.js";
import testimonialRoutes from "./testimonialRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import seedRoutes from "./seedRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/upload", uploadRoutes);
router.use("/seed", seedRoutes);

export default router;
