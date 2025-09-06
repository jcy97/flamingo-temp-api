import { Request, Response } from "express";
import { UserModel } from "../models";
import { AuthenticatedRequest } from "../types";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const search = req.query.search as string;
    const user_type = req.query.user_type as string;

    const result = await UserModel.findMany({
      page,
      limit,
      search,
      user_type,
    });

    const totalPages = Math.ceil(result.total / limit);

    res.json({
      users: result.users,
      total: result.total,
      page,
      limit,
      totalPages,
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

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);

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

    res.json({
      user,
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

export const updateUser = async (
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

    const { userId } = req.params;

    if (req.user.id !== userId && req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "권한이 없습니다.",
        },
      });
      return;
    }

    const { name, avatar, bio } = req.body;
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

    const updatedUser = await UserModel.update(userId, updateData);

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

export const deleteUser = async (
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

    const { userId } = req.params;

    if (req.user.id !== userId && req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "권한이 없습니다.",
        },
      });
      return;
    }

    const deleted = await UserModel.delete(userId);

    if (!deleted) {
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
      message: "사용자가 성공적으로 삭제되었습니다.",
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

export const uploadAvatar = async (
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

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "파일이 업로드되지 않았습니다.",
        },
      });
      return;
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    await UserModel.update(req.user.id, { avatar: avatarUrl });

    res.json({
      avatar_url: avatarUrl,
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

export const followUser = async (
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

    const { userId } = req.params;

    if (req.user.id === userId) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ACTION",
          message: "자기 자신을 팔로우할 수 없습니다.",
        },
      });
      return;
    }

    const targetUser = await UserModel.findById(userId);
    if (!targetUser) {
      res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "사용자를 찾을 수 없습니다.",
        },
      });
      return;
    }

    await UserModel.follow(req.user.id, userId);

    res.json({
      message: "팔로우했습니다.",
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

export const unfollowUser = async (
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

    const { userId } = req.params;

    await UserModel.unfollow(req.user.id, userId);

    res.json({
      message: "언팔로우했습니다.",
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

export const getFollowers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
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

    const followers = await UserModel.getFollowers(userId);

    res.json({
      followers,
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

export const getFollowing = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
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

    const following = await UserModel.getFollowing(userId);

    res.json({
      following,
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

export const blockUser = async (
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

    const { userId } = req.params;

    if (req.user.id === userId) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ACTION",
          message: "자기 자신을 차단할 수 없습니다.",
        },
      });
      return;
    }

    const targetUser = await UserModel.findById(userId);
    if (!targetUser) {
      res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "사용자를 찾을 수 없습니다.",
        },
      });
      return;
    }

    await UserModel.block(req.user.id, userId);

    res.json({
      message: "사용자를 차단했습니다.",
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

export const unblockUser = async (
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

    const { userId } = req.params;

    await UserModel.unblock(req.user.id, userId);

    res.json({
      message: "사용자 차단을 해제했습니다.",
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

export const getBlockedUsers = async (
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

    const blockedUsers = await UserModel.getBlockedUsers(req.user.id);

    res.json({
      blocked_users: blockedUsers,
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
