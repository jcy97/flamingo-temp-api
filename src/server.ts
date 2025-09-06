import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import path from "path";
import dotenv from "dotenv";

import { config } from "./config";
import { initializeDatabase } from "./config/database";
import routes from "./routes";
import workspaceRoutes from "./routes/workspace";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/v1", routes);
app.use("/workspace", workspaceRoutes);

app.get("/", (req, res) => {
  res.json({
    name: "Flamingo Test API",
    version: "1.0.0",
    description: "Test API for Flamingo digital painting software",
    endpoints: {
      health: "/api/v1/health",
      auth: "/api/v1/auth/*",
      users: "/api/v1/users/*",
      projects: "/api/v1/projects/*",
      workspace: "/workspace/*",
    },
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await initializeDatabase();
    console.log("Database initialized successfully");

    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`API Base URL: http://localhost:${config.port}/api/v1`);
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received, shutting down gracefully");
      server.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
    });

    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export default app;
