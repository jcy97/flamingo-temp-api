import { Request, Response } from "express";
import { UserModel } from "../models";
import {
  hashPassword,
  comparePassword,
  generateRandomToken,
} from "../utils/password";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwt";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email";
import {
  loginSchema,
  registerSchema,
  emailSchema,
  changePasswordSchema,
} from "../utils/validation";
import { AuthenticatedRequest } from "../types";
import { pool } from "../config/database";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.details[0].message,
        },
      });
      return;
    }

    const { email, password } = value;

    // 먼저 사용자가 존재하는지 확인
    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: "AUTH_001",
          message: "인증 정보가 일치하지 않습니다.",
        },
      });
      return;
    }

    // 사용자가 존재하면 비밀번호를 포함한 정보 조회
    const userWithPassword = await UserModel.findByIdWithPassword(user.id);
    if (
      !userWithPassword ||
      !(await comparePassword(password, userWithPassword.password))
    ) {
      res.status(401).json({
        success: false,
        error: {
          code: "AUTH_001",
          message: "인증 정보가 일치하지 않습니다.",
        },
      });
      return;
    }

    const { password: _, ...userInfo } = userWithPassword;
    const tokens = generateTokenPair(userInfo);

    res.json({
      user: {
        id: userInfo.id,
        name: userInfo.name,
        user_type: userInfo.user_type,
      },
      token: tokens,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다.",
      },
    });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.details[0].message,
        },
      });
      return;
    }

    const existingUser = await UserModel.findByEmail(value.email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message: "이미 사용 중인 이메일입니다.",
        },
      });
      return;
    }

    const hashedPassword = await hashPassword(value.password);
    const userData = {
      ...value,
      password: hashedPassword,
    };

    const user = await UserModel.create(userData);

    const verificationToken = generateRandomToken();
    await pool.connect().then(async (client) => {
      await client.query(
        "UPDATE users SET email_verification_token = $1 WHERE id = $2",
        [verificationToken, user.id]
      );
      client.release();
    });

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    res.status(201).json({
      success: true,
      data: {
        message: "회원가입이 완료되었습니다. 이메일을 확인해주세요.",
        user_id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다.",
      },
    });
  }
};

export const checkEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "이메일을 입력해주세요.",
        },
      });
      return;
    }

    const { error } = emailSchema.validate({ email });
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.details[0].message,
        },
      });
      return;
    }

    const existingUser = await UserModel.findByEmail(email);

    res.json({
      available: !existingUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다.",
      },
    });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "리프레시 토큰이 필요합니다.",
        },
      });
      return;
    }

    const payload = verifyRefreshToken(refresh_token);
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: "AUTH_001",
          message: "유효하지 않은 토큰입니다.",
        },
      });
      return;
    }

    const tokens = generateTokenPair(user);

    res.json(tokens);
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: "AUTH_001",
        message: "유효하지 않은 리프레시 토큰입니다.",
      },
    });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = emailSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.details[0].message,
        },
      });
      return;
    }

    const { email } = value;
    const user = await UserModel.findByEmail(email);

    if (user) {
      const resetToken = generateRandomToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

      const client = await pool.connect();
      await client.query(
        "UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3",
        [resetToken, resetExpires, user.id]
      );
      client.release();

      try {
        await sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
      }
    }

    res.json({
      message: "비밀번호 재설정 이메일이 발송되었습니다.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다.",
      },
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "토큰과 비밀번호가 필요합니다.",
        },
      });
      return;
    }

    const client = await pool.connect();
    const result = await client.query(
      "SELECT id FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      client.release();
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "유효하지 않거나 만료된 토큰입니다.",
        },
      });
      return;
    }

    const userId = result.rows[0].id;
    const hashedPassword = await hashPassword(password);

    await client.query(
      "UPDATE users SET password = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2",
      [hashedPassword, userId]
    );
    client.release();

    res.json({
      message: "비밀번호가 성공적으로 재설정되었습니다.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다.",
      },
    });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "인증 토큰이 필요합니다.",
        },
      });
      return;
    }

    const client = await pool.connect();
    const result = await client.query(
      "SELECT id FROM users WHERE email_verification_token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      client.release();
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "유효하지 않은 인증 토큰입니다.",
        },
      });
      return;
    }

    const userId = result.rows[0].id;
    await client.query(
      "UPDATE users SET email_verified = true, email_verification_token = NULL WHERE id = $1",
      [userId]
    );
    client.release();

    res.json({
      message: "이메일이 성공적으로 인증되었습니다.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다.",
      },
    });
  }
};

export const resendVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = emailSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.details[0].message,
        },
      });
      return;
    }

    const { email } = value;
    const user = await UserModel.findByEmail(email);

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "사용자를 찾을 수 없습니다.",
        },
      });
      return;
    }

    if (user.email_verified) {
      res.status(400).json({
        success: false,
        error: {
          code: "ALREADY_VERIFIED",
          message: "이미 인증된 계정입니다.",
        },
      });
      return;
    }

    const verificationToken = generateRandomToken();
    const client = await pool.connect();
    await client.query(
      "UPDATE users SET email_verification_token = $1 WHERE id = $2",
      [verificationToken, user.id]
    );
    client.release();

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    res.json({
      message: "인증 이메일이 재발송되었습니다.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다.",
      },
    });
  }
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: "AUTH_001",
          message: "인증이 필요합니다.",
        },
      });
      return;
    }

    res.json({
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다.",
      },
    });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: "AUTH_001",
          message: "인증이 필요합니다.",
        },
      });
      return;
    }

    const { name, avatar } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "업데이트할 정보가 없습니다.",
        },
      });
      return;
    }

    const updatedUser = await UserModel.update(req.user.id, updateData);

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "사용자를 찾을 수 없습니다.",
        },
      });
      return;
    }

    res.json({
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다.",
      },
    });
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: "AUTH_001",
          message: "인증이 필요합니다.",
        },
      });
      return;
    }

    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.details[0].message,
        },
      });
      return;
    }

    const { current_password, new_password } = value;

    const userWithPassword = await UserModel.findByIdWithPassword(req.user.id);
    if (!userWithPassword) {
      res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "사용자를 찾을 수 없습니다.",
        },
      });
      return;
    }

    const isCurrentPasswordValid = await comparePassword(
      current_password,
      userWithPassword.password
    );
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PASSWORD",
          message: "현재 비밀번호가 일치하지 않습니다.",
        },
      });
      return;
    }

    const hashedNewPassword = await hashPassword(new_password);
    await UserModel.update(req.user.id, { password: hashedNewPassword } as any);

    res.json({
      message: "비밀번호가 성공적으로 변경되었습니다.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다.",
      },
    });
  }
};

export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: "AUTH_001",
          message: "인증이 필요합니다.",
        },
      });
      return;
    }

    const { password } = req.body;

    if (!password) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "비밀번호를 입력해주세요.",
        },
      });
      return;
    }

    const userWithPassword = await UserModel.findByIdWithPassword(req.user.id);
    if (!userWithPassword) {
      res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "사용자를 찾을 수 없습니다.",
        },
      });
      return;
    }

    const isPasswordValid = await comparePassword(
      password,
      userWithPassword.password
    );
    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PASSWORD",
          message: "비밀번호가 일치하지 않습니다.",
        },
      });
      return;
    }

    await UserModel.delete(req.user.id);

    res.json({
      message: "계정이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다.",
      },
    });
  }
};
