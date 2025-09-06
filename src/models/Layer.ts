import { pool } from "../config/database";
import { Layer, LayerCreateRequest, LayerUpdateRequest } from "../types";

export class LayerModel {
  static async findByCanvasId(canvasId: string): Promise<Layer[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM layers WHERE canvas_id = $1 ORDER BY order_index ASC",
        [canvasId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async findById(id: string): Promise<Layer | null> {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM layers WHERE id = $1", [
        id,
      ]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async create(
    canvasId: string,
    layerData: LayerCreateRequest
  ): Promise<Layer> {
    const client = await pool.connect();
    try {
      let orderIndex = layerData.order;
      if (orderIndex === undefined) {
        const maxOrderResult = await client.query(
          "SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM layers WHERE canvas_id = $1",
          [canvasId]
        );
        orderIndex = maxOrderResult.rows[0].next_order;
      } else {
        await client.query(
          "UPDATE layers SET order_index = order_index + 1 WHERE canvas_id = $1 AND order_index >= $2",
          [canvasId, orderIndex]
        );
      }

      const persistentData = layerData.layer_data || {
        brushStrokes: [],
        contentBounds: { x: 0, y: 0, width: 0, height: 0 },
      };
      const cleanedData = {
        brushStrokes: persistentData.brushStrokes || [],
        textObjects: persistentData.textObjects || [],
        speechBubbleData: persistentData.speechBubbleData || undefined,
        renderedImage: persistentData.renderedImage || undefined,
        contentBounds: persistentData.contentBounds || {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
      };

      const result = await client.query(
        `INSERT INTO layers (canvas_id, name, type, visible, locked, opacity, blend_mode, order_index, layer_data) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          canvasId,
          layerData.name,
          layerData.type,
          layerData.visible !== undefined ? layerData.visible : true,
          layerData.locked !== undefined ? layerData.locked : false,
          layerData.opacity !== undefined ? layerData.opacity : 1.0,
          layerData.blend_mode || "normal",
          orderIndex,
          JSON.stringify(cleanedData),
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async update(
    id: string,
    layerData: LayerUpdateRequest
  ): Promise<Layer | null> {
    const client = await pool.connect();
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (layerData.name !== undefined) {
        updateFields.push(`name = $${paramIndex}`);
        values.push(layerData.name);
        paramIndex++;
      }

      if (layerData.type !== undefined) {
        updateFields.push(`type = $${paramIndex}`);
        values.push(layerData.type);
        paramIndex++;
      }

      if (layerData.visible !== undefined) {
        updateFields.push(`visible = $${paramIndex}`);
        values.push(layerData.visible);
        paramIndex++;
      }

      if (layerData.locked !== undefined) {
        updateFields.push(`locked = $${paramIndex}`);
        values.push(layerData.locked);
        paramIndex++;
      }

      if (layerData.opacity !== undefined) {
        updateFields.push(`opacity = $${paramIndex}`);
        values.push(layerData.opacity);
        paramIndex++;
      }

      if (layerData.blend_mode !== undefined) {
        updateFields.push(`blend_mode = $${paramIndex}`);
        values.push(layerData.blend_mode);
        paramIndex++;
      }

      if (layerData.layer_data !== undefined) {
        const persistentData = layerData.layer_data;
        const cleanedData = {
          brushStrokes: persistentData.brushStrokes || [],
          textObjects: persistentData.textObjects || [],
          speechBubbleData: persistentData.speechBubbleData || undefined,
          renderedImage: persistentData.renderedImage || undefined,
          contentBounds: persistentData.contentBounds,
        };
        updateFields.push(`layer_data = $${paramIndex}`);
        values.push(JSON.stringify(cleanedData));
        paramIndex++;
      }

      if (layerData.order !== undefined) {
        const currentLayer = await client.query(
          "SELECT * FROM layers WHERE id = $1",
          [id]
        );
        if (currentLayer.rows.length > 0) {
          const currentOrder = currentLayer.rows[0].order_index;
          const canvasId = currentLayer.rows[0].canvas_id;

          if (layerData.order !== currentOrder) {
            if (layerData.order > currentOrder) {
              await client.query(
                "UPDATE layers SET order_index = order_index - 1 WHERE canvas_id = $1 AND order_index > $2 AND order_index <= $3",
                [canvasId, currentOrder, layerData.order]
              );
            } else {
              await client.query(
                "UPDATE layers SET order_index = order_index + 1 WHERE canvas_id = $1 AND order_index >= $2 AND order_index < $3",
                [canvasId, layerData.order, currentOrder]
              );
            }

            updateFields.push(`order_index = $${paramIndex}`);
            values.push(layerData.order);
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
        `UPDATE layers SET ${updateFields.join(
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
      const layerResult = await client.query(
        "SELECT canvas_id, order_index FROM layers WHERE id = $1",
        [id]
      );
      if (layerResult.rows.length === 0) return false;

      const { canvas_id, order_index } = layerResult.rows[0];

      const result = await client.query("DELETE FROM layers WHERE id = $1", [
        id,
      ]);

      if (result.rowCount && result.rowCount > 0) {
        await client.query(
          "UPDATE layers SET order_index = order_index - 1 WHERE canvas_id = $1 AND order_index > $2",
          [canvas_id, order_index]
        );
        return true;
      }
      return false;
    } finally {
      client.release();
    }
  }

  static async getNextOrder(canvasId: string): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM layers WHERE canvas_id = $1",
        [canvasId]
      );
      return result.rows[0].next_order;
    } finally {
      client.release();
    }
  }
}
