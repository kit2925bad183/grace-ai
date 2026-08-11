import api, { setStoredToken, clearStoredToken } from './api';
import type { ApiResponse, AuthResponse, AuthUser, LoginCredentials, RegisterData } from '@/types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Login failed');
  }
  setStoredToken(response.data.data.token);
  return response.data.data;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Registration failed');
  }
  setStoredToken(response.data.data.token);
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
  try {
    await api.post('/auth/logout');
  } finally {
    clearStoredToken();
  }
}

export async function checkAuthorityAccess(): Promise<boolean> {
  try {
    await api.get('/auth/authority-check');
    return true;
  } catch {
    return false;
  }
}
