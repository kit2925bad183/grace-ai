import { Response } from 'express';
import { env } from '../config/env';

export const ACCESS_COOKIE = 'grace_access';
export const REFRESH_COOKIE = 'grace_refresh';

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? ('none' as const) : ('lax' as const),
  path: '/',
};

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, BASE_COOKIE_OPTIONS);
  res.clearCookie(REFRESH_COOKIE, BASE_COOKIE_OPTIONS);
}
