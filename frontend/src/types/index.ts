export type UserRole = 'CITIZEN' | 'DEPARTMENT' | 'HEAD_OF_DEPARTMENTS' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED' | 'PENDING';

export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'BOTH';

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

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  phone?: string;
  avatar?: string;
  authProvider?: AuthProvider;
  emailVerified?: boolean;
  createdAt?: string;
}

export interface RegisterResult {
  user: AuthUser;
  message: string;
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

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/** @deprecated Session tokens are stored in HTTP-only cookies */
export interface AuthResponse {
  token: string;
  user: AuthUser;
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
      return '/user/dashboard';
    case 'DEPARTMENT':
      return '/department/dashboard';
    case 'HEAD_OF_DEPARTMENTS':
      return '/head/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/login';
  }
}

export const ROLE_LABELS: Record<UserRole, string> = {
  CITIZEN: 'Citizen',
  DEPARTMENT: 'Department',
  HEAD_OF_DEPARTMENTS: 'Head of Departments',
  ADMIN: 'Platform Admin',
};
