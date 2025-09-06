import { Request, Response } from "express";
import { ProjectModel, PageModel, CanvasModel, LayerModel } from "../models";
import { AuthenticatedRequest, WorkspaceData } from "../types";

export const getWorkspaceData = async (
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

    const pages = await PageModel.findByProjectId(projectId);

    const workspaceData: WorkspaceData = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        thumbnail: project.thumbnail,
        created_at: project.created_at,
        updated_at: project.updated_at,
      },
      pages: await Promise.all(
        pages.map(async (page) => {
          const canvases = await CanvasModel.findByPageId(page.id);

          return {
            id: page.id,
            name: page.name,
            order: page.order_index,
            canvases: await Promise.all(
              canvases.map(async (canvas) => {
                const layers = await LayerModel.findByCanvasId(canvas.id);

                return {
                  id: canvas.id,
                  name: canvas.name,
                  width: canvas.width,
                  height: canvas.height,
                  x: canvas.x,
                  y: canvas.y,
                  scale: canvas.scale,
                  order: canvas.order_index,
                  layers: layers.map((layer) => ({
                    id: layer.id,
                    name: layer.name,
                    type: layer.type,
                    visible: layer.visible,
                    locked: layer.locked,
                    opacity: layer.opacity,
                    blend_mode: layer.blend_mode,
                    order: layer.order_index,
                    layer_data: layer.layer_data,
                  })),
                };
              })
            ),
          };
        })
      ),
    };

    res.json({
      success: true,
      data: workspaceData,
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
