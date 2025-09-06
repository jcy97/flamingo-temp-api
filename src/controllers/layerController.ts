import { Request, Response } from "express";
import { LayerModel, CanvasModel, PageModel, ProjectModel } from "../models";
import { AuthenticatedRequest } from "../types";
import { layerCreateSchema, layerUpdateSchema } from "../utils/validation";

const checkProjectAccess = async (
  canvasId: string,
  userId: string
): Promise<boolean> => {
  const canvas = await CanvasModel.findById(canvasId);
  if (!canvas) return false;

  const page = await PageModel.findById(canvas.page_id);
  if (!page) return false;

  return await ProjectModel.checkOwnership(page.project_id, userId);
};

export const getLayers = async (
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

    const { canvasId } = req.params;

    const hasAccess = await checkProjectAccess(canvasId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "캔버스에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const layers = await LayerModel.findByCanvasId(canvasId);

    res.json({
      success: true,
      data: layers,
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

export const getLayer = async (
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

    const { canvasId, layerId } = req.params;

    const hasAccess = await checkProjectAccess(canvasId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "캔버스에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const layer = await LayerModel.findById(layerId);

    if (!layer) {
      res.status(404).json({
        success: false,
        error: {
          code: "LAYER_NOT_FOUND",
          message: "레이어를 찾을 수 없습니다.",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: layer,
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

export const createLayer = async (
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

    const { canvasId } = req.params;

    const { error, value } = layerCreateSchema.validate(req.body);
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

    const hasAccess = await checkProjectAccess(canvasId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "캔버스에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const layer = await LayerModel.create(canvasId, value);

    res.status(201).json({
      success: true,
      data: layer,
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

export const updateLayer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { canvasId, layerId } = req.params;

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

    const { error, value } = layerUpdateSchema.validate(req.body);
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

    const hasAccess = await checkProjectAccess(canvasId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "캔버스에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const layer = await LayerModel.update(layerId, value);

    if (!layer) {
      res.status(404).json({
        success: false,
        error: {
          code: "LAYER_NOT_FOUND",
          message: "레이어를 찾을 수 없습니다.",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: layer,
    });
  } catch (error) {
    console.error("UpdateLayer Error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      layerId,
      canvasId,
      requestBody: req.body,
    });

    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다.",
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : String(error),
        }),
      },
    });
  }
};

export const deleteLayer = async (
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

    const { canvasId, layerId } = req.params;

    const hasAccess = await checkProjectAccess(canvasId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "캔버스에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const deleted = await LayerModel.delete(layerId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: {
          code: "LAYER_NOT_FOUND",
          message: "레이어를 찾을 수 없습니다.",
        },
      });
      return;
    }

    res.json({
      success: true,
      message: "레이어가 성공적으로 삭제되었습니다.",
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
