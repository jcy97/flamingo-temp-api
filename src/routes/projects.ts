import express from "express";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import pageRoutes from "./pages";
import canvasRoutes from "./canvases";
import layerRoutes from "./layers";

const router = express.Router();

router.get("/", authenticate, asyncHandler(getProjects));
router.get("/:projectId", authenticate, asyncHandler(getProject));
router.post("/", authenticate, asyncHandler(createProject));
router.put("/:projectId", authenticate, asyncHandler(updateProject));
router.delete("/:projectId", authenticate, asyncHandler(deleteProject));

router.use("/:projectId/pages", pageRoutes);
router.use("/:projectId/pages/:pageId/canvases", canvasRoutes);
router.use("/:projectId/pages/:pageId/canvases/:canvasId/layers", layerRoutes);

export default router;
