import express from "express";
import {
  login,
  register,
  checkEmail,
  refresh,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

router.post("/login", asyncHandler(login));
router.post("/register", asyncHandler(register));
router.get("/check-email", asyncHandler(checkEmail));
router.post("/refresh", asyncHandler(refresh));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password", asyncHandler(resetPassword));
router.post("/verify-email", asyncHandler(verifyEmail));
router.post("/resend-verification", asyncHandler(resendVerification));

router.get("/profile", authenticate, asyncHandler(getProfile));
router.put("/profile", authenticate, asyncHandler(updateProfile));
router.put("/change-password", authenticate, asyncHandler(changePassword));
router.delete("/account", authenticate, asyncHandler(deleteAccount));

export default router;
