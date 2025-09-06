import { pool } from "../config/database";
import { Page, PageCreateRequest, PageUpdateRequest } from "../types";

export class PageModel {
  static async findByProjectId(projectId: string): Promise<Page[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM pages WHERE project_id = $1 ORDER BY order_index ASC",
        [projectId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async findById(id: string): Promise<Page | null> {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM pages WHERE id = $1", [
        id,
      ]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async create(
    projectId: string,
    pageData: PageCreateRequest
  ): Promise<Page> {
    const client = await pool.connect();
    try {
      let orderIndex = pageData.order;
      if (orderIndex === undefined) {
        const maxOrderResult = await client.query(
          "SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM pages WHERE project_id = $1",
          [projectId]
        );
        orderIndex = maxOrderResult.rows[0].next_order;
      } else {
        await client.query(
          "UPDATE pages SET order_index = order_index + 1 WHERE project_id = $1 AND order_index >= $2",
          [projectId, orderIndex]
        );
      }

      const result = await client.query(
        "INSERT INTO pages (project_id, name, order_index) VALUES ($1, $2, $3) RETURNING *",
        [projectId, pageData.name, orderIndex]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async update(
    id: string,
    pageData: PageUpdateRequest
  ): Promise<Page | null> {
    const client = await pool.connect();
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (pageData.name !== undefined) {
        updateFields.push(`name = $${paramIndex}`);
        values.push(pageData.name);
        paramIndex++;
      }

      if (pageData.order !== undefined) {
        const currentPage = await client.query(
          "SELECT * FROM pages WHERE id = $1",
          [id]
        );
        if (currentPage.rows.length > 0) {
          const currentOrder = currentPage.rows[0].order_index;
          const projectId = currentPage.rows[0].project_id;

          if (pageData.order !== currentOrder) {
            if (pageData.order > currentOrder) {
              await client.query(
                "UPDATE pages SET order_index = order_index - 1 WHERE project_id = $1 AND order_index > $2 AND order_index <= $3",
                [projectId, currentOrder, pageData.order]
              );
            } else {
              await client.query(
                "UPDATE pages SET order_index = order_index + 1 WHERE project_id = $1 AND order_index >= $2 AND order_index < $3",
                [projectId, pageData.order, currentOrder]
              );
            }

            updateFields.push(`order_index = $${paramIndex}`);
            values.push(pageData.order);
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
        `UPDATE pages SET ${updateFields.join(
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
      const pageResult = await client.query(
        "SELECT project_id, order_index FROM pages WHERE id = $1",
        [id]
      );
      if (pageResult.rows.length === 0) return false;

      const { project_id, order_index } = pageResult.rows[0];

      const countResult = await client.query(
        "SELECT COUNT(*) as count FROM pages WHERE project_id = $1",
        [project_id]
      );
      if (parseInt(countResult.rows[0].count) <= 1) {
        return false;
      }

      const result = await client.query("DELETE FROM pages WHERE id = $1", [
        id,
      ]);

      if (result.rowCount && result.rowCount > 0) {
        await client.query(
          "UPDATE pages SET order_index = order_index - 1 WHERE project_id = $1 AND order_index > $2",
          [project_id, order_index]
        );
        return true;
      }
      return false;
    } finally {
      client.release();
    }
  }

  static async getNextOrder(projectId: string): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM pages WHERE project_id = $1",
        [projectId]
      );
      return result.rows[0].next_order;
    } finally {
      client.release();
    }
  }
}
