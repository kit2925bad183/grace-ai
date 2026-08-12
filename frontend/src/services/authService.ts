import api, { getApiOrigin } from './api';
import type {
  ApiResponse,
  AuthUser,
  LoginCredentials,
  RegisterData,
  RegisterResult,
  UpdateProfileData,
  ChangePasswordData,
} from '@/types';

export async function login(credentials: LoginCredentials): Promise<{ user: AuthUser }> {
  const response = await api.post<ApiResponse<{ user: AuthUser }>>('/auth/login', credentials);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Login failed');
  }
  return response.data.data;
}

export async function register(data: RegisterData): Promise<RegisterResult> {
  const response = await api.post<ApiResponse<RegisterResult>>('/auth/register', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Registration failed');
  }
  return response.data.data;
}

export async function getMe(): Promise<AuthUser> {
  const response = await api.get<ApiResponse<AuthUser>>('/auth/me');
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to fetch user');
  }
  return response.data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function refreshSession(): Promise<AuthUser> {
  const response = await api.post<ApiResponse<{ user: AuthUser }>>('/auth/refresh');
  if (!response.data.success || !response.data.data?.user) {
    throw new Error(response.data.message || 'Session refresh failed');
  }
  return response.data.data.user;
}

export async function verifyEmail(token: string): Promise<string> {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/verify-email', {
    token,
  });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Email verification failed');
  }
  return response.data.data.message;
}

export async function resendVerification(email: string): Promise<string> {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/resend-verification', {
    email,
  });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to resend verification');
  }
  return response.data.data.message;
}

export async function forgotPassword(email: string): Promise<string> {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', {
    email,
  });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to send reset email');
  }
  return response.data.data.message;
}

export async function resetPassword(token: string, password: string): Promise<string> {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
    token,
    password,
  });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Password reset failed');
  }
  return response.data.data.message;
}

export async function changePassword(data: ChangePasswordData): Promise<string> {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/change-password', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Password change failed');
  }
  return response.data.data.message;
}

export async function updateProfile(data: UpdateProfileData): Promise<AuthUser> {
  const response = await api.patch<ApiResponse<AuthUser>>('/auth/profile', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Profile update failed');
  }
  return response.data.data;
}

export function getGoogleAuthUrl(): string {
  return `${getApiOrigin()}/api/auth/google`;
}

export async function checkAuthorityAccess(): Promise<boolean> {
  try {
    await api.get('/auth/authority-check');
    return true;
  } catch {
    return false;
  }
}
