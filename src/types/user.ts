export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
  bio?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  user_type?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  user_type: string;
  avatar?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}
