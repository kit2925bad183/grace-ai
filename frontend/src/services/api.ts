import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, HealthData } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

let unauthorizedHandler: (() => void) | null = null;
let refreshPromise: Promise<boolean> | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

export function getApiOrigin(): string {
  const explicit = import.meta.env.VITE_API_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  if (base.startsWith('http')) return base;

  return import.meta.env.DEV ? 'http://localhost:5000' : '';
}

function getFriendlyErrorMessage(status: number | undefined, serverMessage?: string): string {
  switch (status) {
    case 400:
      return serverMessage || 'Invalid request. Please check your input.';
    case 401:
      return serverMessage || 'Invalid credentials or session expired.';
    case 403:
      return serverMessage || 'You do not have permission to perform this action.';
    case 404:
      return serverMessage || 'The requested resource was not found.';
    case 409:
      return serverMessage || 'This action conflicts with the current state.';
    case 429:
      return serverMessage || 'Too many requests. Please wait and try again.';
    case 500:
    case 502:
    case 503:
      return serverMessage || 'The server is temporarily unavailable. Database may still be connecting — try again shortly.';
    default:
      if (!status) return 'Cannot reach the API server. Check VITE_API_URL and that the Render backend is running.';
      return serverMessage || 'An unexpected error occurred.';
  }
}

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      const refreshed = await tryRefreshSession();
      if (refreshed) {
        return api(originalRequest);
      }
      unauthorizedHandler?.();
    }

    const message = getFriendlyErrorMessage(status, serverMessage);
    const err = new Error(message) as Error & { status?: number };
    err.status = status;
    return Promise.reject(err);
  }
);

export async function checkHealth(): Promise<HealthData> {
  const response = await api.get<ApiResponse<HealthData> & HealthData>('/health', {
    validateStatus: (status) => status === 200 || status === 503,
  });

  const body = response.data;

  if (body.status && body.database) {
    return {
      status: body.status === 'healthy' ? 'ok' : body.status,
      service: body.service,
      database: body.database,
      version: body.version,
      environment: body.environment,
      timestamp: body.timestamp,
    };
  }

  if (body.data) {
    return body.data;
  }

  throw new Error('Health check failed');
}

export default api;
