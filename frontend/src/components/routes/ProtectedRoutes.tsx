import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50">
      <div className="flex items-center gap-3 text-navy-600">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

interface RoleRouteProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RoleRoute({ allowedRoles, redirectTo = '/unauthorized' }: RoleRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

export function CitizenRoute() {
  return <RoleRoute allowedRoles={['CITIZEN']} />;
}

export function AuthorityRoute() {
  return <RoleRoute allowedRoles={['AUTHORITY', 'ADMIN']} />;
}

export function OfficerRoute() {
  return <RoleRoute allowedRoles={['OFFICER']} />;
}

export function AdminRoute() {
  return <RoleRoute allowedRoles={['ADMIN']} />;
}

export function GuestRoute() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <LoadingScreen />;
  if (isAuthenticated && user) {
    const paths: Record<UserRole, string> = {
      CITIZEN: '/citizen/dashboard',
      AUTHORITY: '/authority/dashboard',
      OFFICER: '/officer/dashboard',
      ADMIN: '/admin/system-data',
    };
    return <Navigate to={paths[user.role]} replace />;
  }

  return <Outlet />;
}
