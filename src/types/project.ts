export interface Project {
  id: string;
  name: string;
  owner_id: string;
  deleted_at?: string | null;
  thumbnail?: string;
  description?: string;
  updated_at: string;
  created_at: string;
}

export interface ProjectCreateRequest {
  name: string;
  description?: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  thumbnail?: string;
}

export interface ProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  role: "owner" | "editor" | "viewer";
  created_at: string;
}

export interface ProjectListResponse {
  success: boolean;
  data: Project[];
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
