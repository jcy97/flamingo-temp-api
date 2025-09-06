import { Request, Response, NextFunction } from "express";
import { config } from "../config";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let code = error.code || "INTERNAL_ERROR";
  let message = error.message || "Internal server error";
  let details = error.details;

  if (error.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "입력 데이터가 유효하지 않습니다.";
  }

  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "AUTH_001";
    message = "유효하지 않은 토큰입니다.";
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    code = "AUTH_002";
    message = "토큰이 만료되었습니다.";
  }

  if (config.nodeEnv === "development") {
    console.error("Error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode,
      code,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(config.nodeEnv === "development" && { stack: error.stack }),
    },
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `경로 ${req.originalUrl}을 찾을 수 없습니다.`,
    },
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
