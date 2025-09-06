import jwt from "jsonwebtoken";
import { config } from "../config";
import { TokenPayload } from "../types";

export const generateAccessToken = (
  payload: Omit<TokenPayload, "iat" | "exp">
): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (
  payload: Omit<TokenPayload, "iat" | "exp">
): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid access token");
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

export const generateTokenPair = (user: {
  id: string;
  email: string;
  role: string;
}) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return {
    access_token: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    expires_in: 24 * 60 * 60,
  };
};
