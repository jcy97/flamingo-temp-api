import { Request, Response } from "express";
import { ProjectModel, PageModel, CanvasModel, LayerModel } from "../models";
import { AuthenticatedRequest } from "../types";
import { projectCreateSchema, projectUpdateSchema } from "../utils/validation";

export const getProjects = async (
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

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const search = req.query.search as string;

    const result = await ProjectModel.findByOwner(req.user.id, {
      page,
      limit,
      search,
    });

    res.json({
      success: true,
      data: result.projects,
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

export const getProject = async (
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

    const { projectId } = req.params;

    const project = await ProjectModel.findById(projectId);

    if (!project) {
      res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "프로젝트를 찾을 수 없습니다.",
        },
      });
      return;
    }

    if (project.owner_id !== req.user.id) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "프로젝트에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: project,
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

export const createProject = async (
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

    const { error, value } = projectCreateSchema.validate(req.body);
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

    const projectData = {
      ...value,
      owner_id: req.user.id,
    };

    const project = await ProjectModel.create(projectData);

    const defaultPage = await PageModel.create(project.id, {
      name: "페이지 1",
      order: 1,
    });

    const defaultCanvas = await CanvasModel.create(defaultPage.id, {
      name: "캔버스 1",
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      scale: 1.0,
      order: 1,
    });

    await LayerModel.create(defaultCanvas.id, {
      name: "레이어 1",
      visible: true,
      locked: false,
      opacity: 1.0,
      blend_mode: "normal",
      order: 1,
      layer_data: {
        brushStrokes: [],
        textData: undefined,
        speechBubbleData: undefined,
        renderedImage: undefined,
        contentBounds: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: project,
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

export const updateProject = async (
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

    const { projectId } = req.params;

    const existingProject = await ProjectModel.findById(projectId);
    if (!existingProject) {
      res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "프로젝트를 찾을 수 없습니다.",
        },
      });
      return;
    }

    if (existingProject.owner_id !== req.user.id) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "프로젝트를 수정할 권한이 없습니다.",
        },
      });
      return;
    }

    const { error, value } = projectUpdateSchema.validate(req.body);
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

    const updatedProject = await ProjectModel.update(projectId, value);

    if (!updatedProject) {
      res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "프로젝트를 찾을 수 없습니다.",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: updatedProject,
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

export const deleteProject = async (
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

    const { projectId } = req.params;

    const existingProject = await ProjectModel.findById(projectId);
    if (!existingProject) {
      res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "프로젝트를 찾을 수 없습니다.",
        },
      });
      return;
    }

    if (existingProject.owner_id !== req.user.id) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "프로젝트를 삭제할 권한이 없습니다.",
        },
      });
      return;
    }

    const deleted = await ProjectModel.delete(projectId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "프로젝트를 찾을 수 없습니다.",
        },
      });
      return;
    }

    res.json({
      message: "프로젝트가 성공적으로 삭제되었습니다.",
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
