import { Router } from "express";
import { sitemap, reviewStats } from "../controllers/seoController.js";

const router = Router();

router.get("/sitemap.xml", sitemap);
router.get("/api/seo/review-stats", reviewStats);

export default router;
