import { pool } from "../config/database";
import { Project, ProjectCreateRequest, ProjectUpdateRequest } from "../types";

export class ProjectModel {
  static async findById(id: string): Promise<Project | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM projects WHERE id = $1 AND deleted_at IS NULL",
        [id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async findByIdWithDeleted(id: string): Promise<Project | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM projects WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async create(
    projectData: ProjectCreateRequest & { owner_id: string }
  ): Promise<Project> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO projects (name, description, owner_id) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [projectData.name, projectData.description || "", projectData.owner_id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async update(
    id: string,
    projectData: ProjectUpdateRequest
  ): Promise<Project | null> {
    const client = await pool.connect();
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (projectData.name !== undefined) {
        updateFields.push(`name = $${paramIndex}`);
        values.push(projectData.name);
        paramIndex++;
      }

      if (projectData.description !== undefined) {
        updateFields.push(`description = $${paramIndex}`);
        values.push(projectData.description);
        paramIndex++;
      }

      if (projectData.thumbnail !== undefined) {
        updateFields.push(`thumbnail = $${paramIndex}`);
        values.push(projectData.thumbnail);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return await this.findById(id);
      }

      updateFields.push(`updated_at = $${paramIndex}`);
      values.push(new Date());
      paramIndex++;

      values.push(id);

      const result = await client.query(
        `UPDATE projects SET ${updateFields.join(", ")} 
         WHERE id = $${paramIndex} AND deleted_at IS NULL 
         RETURNING *`,
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
      const result = await client.query(
        "UPDATE projects SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL",
        [id]
      );
      return (result.rowCount || 0) > 0;
    } finally {
      client.release();
    }
  }

  static async findMany(params: {
    page?: number;
    limit?: number;
    search?: string;
    owner_id?: string;
  }): Promise<{ projects: Project[]; total: number }> {
    const { page = 1, limit = 10, search, owner_id } = params;
    const offset = (page - 1) * limit;

    const client = await pool.connect();
    try {
      let whereClause = "WHERE deleted_at IS NULL";
      let queryParams: any[] = [];
      let paramIndex = 1;

      if (search) {
        whereClause += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (owner_id) {
        whereClause += ` AND owner_id = $${paramIndex}`;
        queryParams.push(owner_id);
        paramIndex++;
      }

      const countQuery = `SELECT COUNT(*) FROM projects ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const projectsQuery = `
        SELECT * FROM projects ${whereClause}
        ORDER BY updated_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const projectsResult = await client.query(projectsQuery, queryParams);

      return {
        projects: projectsResult.rows,
        total,
      };
    } finally {
      client.release();
    }
  }

  static async findByOwner(
    ownerId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ): Promise<{ projects: Project[]; total: number }> {
    return this.findMany({ ...params, owner_id: ownerId });
  }

  static async checkOwnership(
    projectId: string,
    userId: string
  ): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT id FROM projects WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL",
        [projectId, userId]
      );
      return result.rows.length > 0;
    } finally {
      client.release();
    }
  }

  static async addCollaborator(
    projectId: string,
    userId: string,
    role: string = "viewer"
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        "INSERT INTO project_collaborators (project_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3",
        [projectId, userId, role]
      );
    } finally {
      client.release();
    }
  }

  static async removeCollaborator(
    projectId: string,
    userId: string
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        "DELETE FROM project_collaborators WHERE project_id = $1 AND user_id = $2",
        [projectId, userId]
      );
    } finally {
      client.release();
    }
  }

  static async getCollaborators(projectId: string): Promise<any[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT u.id, u.email, u.name, u.user_type, u.avatar, pc.role, pc.created_at
         FROM users u
         INNER JOIN project_collaborators pc ON u.id = pc.user_id
         WHERE pc.project_id = $1`,
        [projectId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }
}
