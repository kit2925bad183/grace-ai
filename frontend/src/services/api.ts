import axios, { AxiosError } from 'axios';

import type { ApiResponse, HealthData } from '@/types';



const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'grace_token';



export const api = axios.create({

  baseURL: API_BASE_URL,

  headers: {

    'Content-Type': 'application/json',

  },

  timeout: 15000,

});



let unauthorizedHandler: (() => void) | null = null;



export function setUnauthorizedHandler(handler: () => void): void {

  unauthorizedHandler = handler;

}



export function getStoredToken(): string | null {

  return localStorage.getItem(TOKEN_KEY);

}



export function setStoredToken(token: string): void {

  localStorage.setItem(TOKEN_KEY, token);

}



export function clearStoredToken(): void {

  localStorage.removeItem(TOKEN_KEY);

}



function getFriendlyErrorMessage(status: number | undefined, serverMessage?: string): string {

  switch (status) {

    case 400:

      return serverMessage || 'Invalid request. Please check your input.';

    case 401:

      return serverMessage || 'Invalid credentials or session expired.';

    case 403:

      return 'You do not have permission to perform this action.';

    case 404:

      return serverMessage || 'The requested resource was not found.';

    case 409:

      return serverMessage || 'This action conflicts with the current state.';

    case 429:

      return 'Too many requests. Please wait and try again.';

    case 500:

    case 502:

    case 503:

      return 'Unable to process request. Please try again later.';

    default:

      if (!status) return 'Server unavailable. Please check your connection.';

      return serverMessage || 'An unexpected error occurred.';

  }

}



api.interceptors.request.use((config) => {

  const token = getStoredToken();

  if (token) {

    config.headers.Authorization = `Bearer ${token}`;

  }

  return config;

});



api.interceptors.response.use(

  (response) => response,

  (error: AxiosError<ApiResponse>) => {

    const status = error.response?.status;

    const serverMessage = error.response?.data?.message;

    const message = getFriendlyErrorMessage(status, serverMessage);



    if (status === 401 && unauthorizedHandler) {

      const isAuthEndpoint = error.config?.url?.includes('/auth/login');

      if (!isAuthEndpoint) {

        unauthorizedHandler();

      }

    }



    const err = new Error(message) as Error & { status?: number };

    err.status = status;

    return Promise.reject(err);

  }

);



export async function checkHealth(): Promise<HealthData> {
  const response = await api.get<ApiResponse<HealthData>>('/health', {
    validateStatus: (status) => status === 200 || status === 503,
  });

  if (response.data.data) {
    return response.data.data;
  }

  throw new Error('Health check failed');
}



export default api;

