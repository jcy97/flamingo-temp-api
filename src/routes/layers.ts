import express from "express";
import {
  getLayers,
  getLayer,
  createLayer,
  updateLayer,
  deleteLayer,
} from "../controllers/layerController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router({ mergeParams: true });

router.get("/", authenticate, asyncHandler(getLayers));
router.get("/:layerId", authenticate, asyncHandler(getLayer));
router.post("/", authenticate, asyncHandler(createLayer));
router.put("/:layerId", authenticate, asyncHandler(updateLayer));
router.delete("/:layerId", authenticate, asyncHandler(deleteLayer));

export default router;
