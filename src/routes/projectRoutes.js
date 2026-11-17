import { Router } from "express";
import {
  getProjects, getAllProjects, createProject, updateProject,
  deleteProject, reorderProjects,
} from "../controllers/projectController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", getProjects);
router.get("/admin/all", protect, getAllProjects);
router.put("/admin/reorder", protect, reorderProjects);
router.post("/", protect, createProject);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

export default router;
