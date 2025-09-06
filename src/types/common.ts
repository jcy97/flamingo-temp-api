import { Request } from "express";
import { User } from "./auth";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}
