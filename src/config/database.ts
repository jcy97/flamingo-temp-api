import { Pool, PoolConfig } from "pg";

const config: PoolConfig = {
  host:
    process.env.DB_HOST ||
    "ls-8eea31621b6e9c9115572ec2d46569a015adad63.cjg0qkee690g.ap-northeast-2.rds.amazonaws.com",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "dbmasteruser",
  password: process.env.DB_PASSWORD || "flamingo",
  database: process.env.DB_NAME || "dbmaster",
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(config);

export const initializeDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL database");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        user_type VARCHAR(50) NOT NULL,
        avatar TEXT,
        email_verified BOOLEAN DEFAULT false,
        email_verification_token TEXT,
        password_reset_token TEXT,
        password_reset_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        thumbnail TEXT,
        deleted_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS project_collaborators (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'viewer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, user_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_follows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_blocks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blocker_id, blocked_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS canvases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        width INTEGER NOT NULL DEFAULT 800,
        height INTEGER NOT NULL DEFAULT 600,
        x REAL NOT NULL DEFAULT 0,
        y REAL NOT NULL DEFAULT 0,
        scale REAL NOT NULL DEFAULT 1.0,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS layers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'brush',
        visible BOOLEAN NOT NULL DEFAULT true,
        locked BOOLEAN NOT NULL DEFAULT false,
        opacity REAL NOT NULL DEFAULT 1.0,
        blend_mode VARCHAR(50) NOT NULL DEFAULT 'normal',
        order_index INTEGER NOT NULL,
        layer_data JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add type column to existing layers table if it doesn't exist
    await client.query(`
      ALTER TABLE layers 
      ADD COLUMN IF NOT EXISTS type VARCHAR(50) NOT NULL DEFAULT 'brush'
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
      CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
      CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);
      CREATE INDEX IF NOT EXISTS idx_pages_project_id ON pages(project_id);
      CREATE INDEX IF NOT EXISTS idx_pages_order ON pages(project_id, order_index);
      CREATE INDEX IF NOT EXISTS idx_canvases_page_id ON canvases(page_id);
      CREATE INDEX IF NOT EXISTS idx_canvases_order ON canvases(page_id, order_index);
      CREATE INDEX IF NOT EXISTS idx_layers_canvas_id ON layers(canvas_id);
      CREATE INDEX IF NOT EXISTS idx_layers_order ON layers(canvas_id, order_index);
    `);

    client.release();
    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
};
