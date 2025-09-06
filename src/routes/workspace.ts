import express from "express";
import { getWorkspaceData } from "../controllers/workspaceController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

router.get("/:projectId", authenticate, asyncHandler(getWorkspaceData));

export default router;
