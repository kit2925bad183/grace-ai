export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface HealthData {
  status: string;
  service?: string;
  version?: string;
  environment?: string;
  timestamp?: string;
  database: string;
}

export type UserRole = 'CITIZEN' | 'AUTHORITY' | 'OFFICER' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

/** @deprecated Use AuthUser instead */
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case 'CITIZEN':
      return '/citizen/dashboard';
    case 'AUTHORITY':
      return '/authority/dashboard';
    case 'OFFICER':
      return '/officer/dashboard';
    case 'ADMIN':
      return '/admin/system-data';
    default:
      return '/login';
  }
}
