import { pool } from "../config/database";
import { User, RegisterRequest, UpdateUserRequest } from "../types";

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT id, email, name, role, user_type, avatar, email_verified, created_at, updated_at FROM users WHERE email = $1",
        [email]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async findByIdWithPassword(
    id: string
  ): Promise<(User & { password: string }) | null> {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM users WHERE id = $1", [
        id,
      ]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async findById(id: string): Promise<User | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT id, email, name, role, user_type, avatar, email_verified, created_at, updated_at FROM users WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async create(
    userData: RegisterRequest & { password: string }
  ): Promise<User> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO users (email, name, password, user_type, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, email, name, role, user_type, avatar, email_verified, created_at, updated_at`,
        [
          userData.email,
          userData.name,
          userData.password,
          userData.user_type,
          "user",
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async update(
    id: string,
    userData: Partial<User>
  ): Promise<User | null> {
    const client = await pool.connect();
    try {
      const setClause = Object.keys(userData)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(", ");
      const values = [id, ...Object.values(userData), new Date()];

      const result = await client.query(
        `UPDATE users SET ${setClause}, updated_at = $${values.length} 
         WHERE id = $1 
         RETURNING id, email, name, role, user_type, avatar, email_verified, created_at, updated_at`,
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
      const result = await client.query("DELETE FROM users WHERE id = $1", [
        id,
      ]);
      return (result.rowCount || 0) > 0;
    } finally {
      client.release();
    }
  }

  static async findMany(params: {
    page?: number;
    limit?: number;
    search?: string;
    user_type?: string;
  }): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 10, search, user_type } = params;
    const offset = (page - 1) * limit;

    const client = await pool.connect();
    try {
      let whereClause = "";
      let queryParams: any[] = [];
      let paramIndex = 1;

      const conditions: string[] = [];

      if (search) {
        conditions.push(
          `(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`
        );
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (user_type) {
        conditions.push(`user_type = $${paramIndex}`);
        queryParams.push(user_type);
        paramIndex++;
      }

      if (conditions.length > 0) {
        whereClause = "WHERE " + conditions.join(" AND ");
      }

      const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const usersQuery = `
        SELECT id, email, name, role, user_type, avatar, email_verified, created_at, updated_at 
        FROM users ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const usersResult = await client.query(usersQuery, queryParams);

      return {
        users: usersResult.rows,
        total,
      };
    } finally {
      client.release();
    }
  }

  static async follow(followerId: string, followingId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        "INSERT INTO user_follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [followerId, followingId]
      );
    } finally {
      client.release();
    }
  }

  static async unfollow(
    followerId: string,
    followingId: string
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        "DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2",
        [followerId, followingId]
      );
    } finally {
      client.release();
    }
  }

  static async getFollowers(userId: string): Promise<User[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT u.id, u.email, u.name, u.role, u.user_type, u.avatar, u.email_verified, u.created_at, u.updated_at
         FROM users u
         INNER JOIN user_follows uf ON u.id = uf.follower_id
         WHERE uf.following_id = $1`,
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async getFollowing(userId: string): Promise<User[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT u.id, u.email, u.name, u.role, u.user_type, u.avatar, u.email_verified, u.created_at, u.updated_at
         FROM users u
         INNER JOIN user_follows uf ON u.id = uf.following_id
         WHERE uf.follower_id = $1`,
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async block(blockerId: string, blockedId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        "INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [blockerId, blockedId]
      );
    } finally {
      client.release();
    }
  }

  static async unblock(blockerId: string, blockedId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        "DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2",
        [blockerId, blockedId]
      );
    } finally {
      client.release();
    }
  }

  static async getBlockedUsers(userId: string): Promise<User[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT u.id, u.email, u.name, u.role, u.user_type, u.avatar, u.email_verified, u.created_at, u.updated_at
         FROM users u
         INNER JOIN user_blocks ub ON u.id = ub.blocked_id
         WHERE ub.blocker_id = $1`,
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }
}
