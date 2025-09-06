export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  user_type: UserType;
  agree_terms: boolean;
  agree_privacy: boolean;
  agree_marketing?: boolean;
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

export type UserType = "artist" | "student" | "teacher";

export interface LoginSuccessResponse {
  user: {
    id: string;
    name: string;
    user_type: string;
  };
  token: {
    access_token: string;
    refreshToken: string;
    expires_in?: number;
  };
}

export interface RegisterResponse {
  success: true;
  data: {
    message: string;
    user_id: string;
    email: string;
  };
}

export interface CheckEmailResponse {
  available: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}
