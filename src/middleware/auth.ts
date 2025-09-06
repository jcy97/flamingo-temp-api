import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { pool } from "../config/database";
import { AuthenticatedRequest } from "../types";

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: {
          code: "AUTH_001",
          message: "인증 토큰이 없습니다.",
        },
      });
      return;
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: "AUTH_001",
          message: "인증 토큰이 없습니다.",
        },
      });
      return;
    }

    const payload = verifyAccessToken(token);

    const client = await pool.connect();
    const result = await client.query(
      "SELECT id, email, name, role, user_type, avatar, email_verified, created_at, updated_at FROM users WHERE id = $1",
      [payload.userId]
    );
    client.release();

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: {
          code: "AUTH_001",
          message: "유효하지 않은 사용자입니다.",
        },
      });
      return;
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: "AUTH_001",
        message: "유효하지 않은 토큰입니다.",
      },
    });
  }
};

export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      next();
      return;
    }

    const payload = verifyAccessToken(token);

    const client = await pool.connect();
    const result = await client.query(
      "SELECT id, email, name, role, user_type, avatar, email_verified, created_at, updated_at FROM users WHERE id = $1",
      [payload.userId]
    );
    client.release();

    if (result.rows.length > 0) {
      req.user = result.rows[0];
    }

    next();
  } catch (error) {
    next();
  }
};
