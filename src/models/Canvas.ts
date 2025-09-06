import { pool } from "../config/database";
import { Canvas, CanvasCreateRequest, CanvasUpdateRequest } from "../types";

export class CanvasModel {
  static async findByPageId(pageId: string): Promise<Canvas[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM canvases WHERE page_id = $1 ORDER BY order_index ASC",
        [pageId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async findById(id: string): Promise<Canvas | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM canvases WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async create(
    pageId: string,
    canvasData: CanvasCreateRequest
  ): Promise<Canvas> {
    const client = await pool.connect();
    try {
      let orderIndex = canvasData.order;
      if (orderIndex === undefined) {
        const maxOrderResult = await client.query(
          "SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM canvases WHERE page_id = $1",
          [pageId]
        );
        orderIndex = maxOrderResult.rows[0].next_order;
      } else {
        await client.query(
          "UPDATE canvases SET order_index = order_index + 1 WHERE page_id = $1 AND order_index >= $2",
          [pageId, orderIndex]
        );
      }

      const result = await client.query(
        `INSERT INTO canvases (page_id, name, width, height, x, y, scale, order_index) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          pageId,
          canvasData.name,
          canvasData.width || 800,
          canvasData.height || 600,
          canvasData.x || 0,
          canvasData.y || 0,
          canvasData.scale || 1.0,
          orderIndex,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async update(
    id: string,
    canvasData: CanvasUpdateRequest
  ): Promise<Canvas | null> {
    const client = await pool.connect();
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (canvasData.name !== undefined) {
        updateFields.push(`name = $${paramIndex}`);
        values.push(canvasData.name);
        paramIndex++;
      }

      if (canvasData.width !== undefined) {
        updateFields.push(`width = $${paramIndex}`);
        values.push(canvasData.width);
        paramIndex++;
      }

      if (canvasData.height !== undefined) {
        updateFields.push(`height = $${paramIndex}`);
        values.push(canvasData.height);
        paramIndex++;
      }

      if (canvasData.x !== undefined) {
        updateFields.push(`x = $${paramIndex}`);
        values.push(canvasData.x);
        paramIndex++;
      }

      if (canvasData.y !== undefined) {
        updateFields.push(`y = $${paramIndex}`);
        values.push(canvasData.y);
        paramIndex++;
      }

      if (canvasData.scale !== undefined) {
        updateFields.push(`scale = $${paramIndex}`);
        values.push(canvasData.scale);
        paramIndex++;
      }

      if (canvasData.order !== undefined) {
        const currentCanvas = await client.query(
          "SELECT * FROM canvases WHERE id = $1",
          [id]
        );
        if (currentCanvas.rows.length > 0) {
          const currentOrder = currentCanvas.rows[0].order_index;
          const pageId = currentCanvas.rows[0].page_id;

          if (canvasData.order !== currentOrder) {
            if (canvasData.order > currentOrder) {
              await client.query(
                "UPDATE canvases SET order_index = order_index - 1 WHERE page_id = $1 AND order_index > $2 AND order_index <= $3",
                [pageId, currentOrder, canvasData.order]
              );
            } else {
              await client.query(
                "UPDATE canvases SET order_index = order_index + 1 WHERE page_id = $1 AND order_index >= $2 AND order_index < $3",
                [pageId, canvasData.order, currentOrder]
              );
            }

            updateFields.push(`order_index = $${paramIndex}`);
            values.push(canvasData.order);
            paramIndex++;
          }
        }
      }

      if (updateFields.length === 0) {
        return await this.findById(id);
      }

      updateFields.push(`updated_at = $${paramIndex}`);
      values.push(new Date());
      paramIndex++;

      values.push(id);

      const result = await client.query(
        `UPDATE canvases SET ${updateFields.join(
          ", "
        )} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async delete(id: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      const canvasResult = await client.query(
        "SELECT page_id, order_index FROM canvases WHERE id = $1",
        [id]
      );
      if (canvasResult.rows.length === 0) return false;

      const { page_id, order_index } = canvasResult.rows[0];

      const countResult = await client.query(
        "SELECT COUNT(*) as count FROM canvases WHERE page_id = $1",
        [page_id]
      );
      if (parseInt(countResult.rows[0].count) <= 1) {
        return false;
      }

      const result = await client.query("DELETE FROM canvases WHERE id = $1", [
        id,
      ]);

      if (result.rowCount && result.rowCount > 0) {
        await client.query(
          "UPDATE canvases SET order_index = order_index - 1 WHERE page_id = $1 AND order_index > $2",
          [page_id, order_index]
        );
        return true;
      }
      return false;
    } finally {
      client.release();
    }
  }

  static async getNextOrder(pageId: string): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM canvases WHERE page_id = $1",
        [pageId]
      );
      return result.rows[0].next_order;
    } finally {
      client.release();
    }
  }
}
