import express from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import projectRoutes from "./projects";
import workspaceRoutes from "./workspace";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/workspace", workspaceRoutes);

router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Flamingo Test API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
