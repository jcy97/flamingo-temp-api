import express from "express";
import {
  getCanvases,
  getCanvas,
  createCanvas,
  updateCanvas,
  deleteCanvas,
} from "../controllers/canvasController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router({ mergeParams: true });

router.get("/", authenticate, asyncHandler(getCanvases));
router.get("/:canvasId", authenticate, asyncHandler(getCanvas));
router.post("/", authenticate, asyncHandler(createCanvas));
router.put("/:canvasId", authenticate, asyncHandler(updateCanvas));
router.delete("/:canvasId", authenticate, asyncHandler(deleteCanvas));

export default router;
