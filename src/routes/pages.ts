import express from "express";
import {
  getPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
} from "../controllers/pageController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router({ mergeParams: true });

router.get("/", authenticate, asyncHandler(getPages));
router.get("/:pageId", authenticate, asyncHandler(getPage));
router.post("/", authenticate, asyncHandler(createPage));
router.put("/:pageId", authenticate, asyncHandler(updatePage));
router.delete("/:pageId", authenticate, asyncHandler(deletePage));

export default router;
