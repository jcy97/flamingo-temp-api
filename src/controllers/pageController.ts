import { Request, Response } from "express";
import { PageModel, ProjectModel } from "../models";
import { AuthenticatedRequest } from "../types";
import { pageCreateSchema, pageUpdateSchema } from "../utils/validation";

export const getPages = async (
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

    const hasAccess = await ProjectModel.checkOwnership(projectId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "프로젝트에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const pages = await PageModel.findByProjectId(projectId);

    res.json({
      success: true,
      data: pages,
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

export const getPage = async (
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

    const { projectId, pageId } = req.params;

    const hasAccess = await ProjectModel.checkOwnership(projectId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "프로젝트에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const page = await PageModel.findById(pageId);

    if (!page) {
      res.status(404).json({
        success: false,
        error: {
          code: "PAGE_NOT_FOUND",
          message: "페이지를 찾을 수 없습니다.",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: page,
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

export const createPage = async (
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

    const { error, value } = pageCreateSchema.validate(req.body);
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

    const hasAccess = await ProjectModel.checkOwnership(projectId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "프로젝트에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const page = await PageModel.create(projectId, value);

    res.status(201).json({
      success: true,
      data: page,
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

export const updatePage = async (
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

    const { projectId, pageId } = req.params;

    const { error, value } = pageUpdateSchema.validate(req.body);
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

    const hasAccess = await ProjectModel.checkOwnership(projectId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "프로젝트에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const page = await PageModel.update(pageId, value);

    if (!page) {
      res.status(404).json({
        success: false,
        error: {
          code: "PAGE_NOT_FOUND",
          message: "페이지를 찾을 수 없습니다.",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: page,
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

export const deletePage = async (
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

    const { projectId, pageId } = req.params;

    const hasAccess = await ProjectModel.checkOwnership(projectId, req.user.id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "프로젝트에 접근할 권한이 없습니다.",
        },
      });
      return;
    }

    const deleted = await PageModel.delete(pageId);

    if (!deleted) {
      res.status(400).json({
        success: false,
        error: {
          code: "DELETE_FAILED",
          message:
            "페이지를 삭제할 수 없습니다. 마지막 페이지이거나 페이지를 찾을 수 없습니다.",
        },
      });
      return;
    }

    res.json({
      success: true,
      message: "페이지가 성공적으로 삭제되었습니다.",
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
