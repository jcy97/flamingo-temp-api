import { Request, Response } from "express";
import { CanvasModel, PageModel, ProjectModel } from "../models";
import { AuthenticatedRequest } from "../types";
import { canvasCreateSchema, canvasUpdateSchema } from "../utils/validation";

const checkProjectAccess = async (
  pageId: string,
  userId: string
): Promise<boolean> => {
  const page = await PageModel.findById(pageId);
  if (!page) return false;
  return await ProjectModel.checkOwnership(page.project_id, userId);
};

export const getCanvases = async (
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

    const { pageId } = req.params;

    const hasAccess = await checkProjectAccess(pageId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "페이지에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const canvases = await CanvasModel.findByPageId(pageId);

    res.json({
      success: true,
      data: canvases,
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

export const getCanvas = async (
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

    const { pageId, canvasId } = req.params;

    const hasAccess = await checkProjectAccess(pageId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "페이지에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const canvas = await CanvasModel.findById(canvasId);

    if (!canvas) {
      res.status(404).json({
        success: false,
        error: {
          code: "CANVAS_NOT_FOUND",
          message: "캔버스를 찾을 수 없습니다.",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: canvas,
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

export const createCanvas = async (
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

    const { pageId } = req.params;

    const { error, value } = canvasCreateSchema.validate(req.body);
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

    const hasAccess = await checkProjectAccess(pageId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "페이지에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const canvas = await CanvasModel.create(pageId, value);

    res.status(201).json({
      success: true,
      data: canvas,
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

export const updateCanvas = async (
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

    const { pageId, canvasId } = req.params;

    const { error, value } = canvasUpdateSchema.validate(req.body);
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

    const hasAccess = await checkProjectAccess(pageId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "페이지에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const canvas = await CanvasModel.update(canvasId, value);

    if (!canvas) {
      res.status(404).json({
        success: false,
        error: {
          code: "CANVAS_NOT_FOUND",
          message: "캔버스를 찾을 수 없습니다.",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: canvas,
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

export const deleteCanvas = async (
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

    const { pageId, canvasId } = req.params;

    const hasAccess = await checkProjectAccess(pageId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "페이지에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const deleted = await CanvasModel.delete(canvasId);

    if (!deleted) {
      res.status(400).json({
        success: false,
        error: {
          code: "DELETE_FAILED",
          message:
            "캔버스를 삭제할 수 없습니다. 마지막 캔버스이거나 캔버스를 찾을 수 없습니다.",
        },
      });
      return;
    }

    res.json({
      success: true,
      message: "캔버스가 성공적으로 삭제되었습니다.",
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
