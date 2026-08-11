import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '@/services/authService';
import { setUnauthorizedHandler, getStoredToken, clearStoredToken } from '@/services/api';
import type { AuthUser, LoginCredentials, RegisterData, UserRole } from '@/types';
import { getRoleDashboardPath } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const me = await authService.getMe();
      setUser(me);
      return me;
    } catch {
      clearStoredToken();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearStoredToken();
      setUser(null);
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthUser> => {
      const result = await authService.login(credentials);
      setUser(result.user);
      return result.user;
    },
    []
  );

  const register = useCallback(async (data: RegisterData): Promise<AuthUser> => {
    const result = await authService.register(data);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const hasRole = useCallback(
    (...roles: UserRole[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
      hasRole,
    }),
    [user, loading, login, register, logout, refreshUser, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useRedirectIfAuthenticated(): void {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [user, loading, navigate]);
}
