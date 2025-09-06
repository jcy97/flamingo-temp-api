import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadAvatar,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from "../controllers/userController";
import { authenticate, optionalAuthenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

router.get("/", optionalAuthenticate, asyncHandler(getUsers));
router.get("/blocked", authenticate, asyncHandler(getBlockedUsers));
router.get("/:userId", asyncHandler(getUserById));
router.put("/:userId", authenticate, asyncHandler(updateUser));
router.delete("/:userId", authenticate, asyncHandler(deleteUser));

router.post(
  "/avatar",
  authenticate,
  upload.single("avatar"),
  asyncHandler(uploadAvatar)
);

router.post("/:userId/follow", authenticate, asyncHandler(followUser));
router.delete("/:userId/follow", authenticate, asyncHandler(unfollowUser));
router.get("/:userId/followers", asyncHandler(getFollowers));
router.get("/:userId/following", asyncHandler(getFollowing));

router.post("/:userId/block", authenticate, asyncHandler(blockUser));
router.delete("/:userId/block", authenticate, asyncHandler(unblockUser));

export default router;
