import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleDashboardPath, type UserRole } from '@/types';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-grace-cream">
      <div className="flex items-center gap-3 text-grace-coffee">
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

export function UserRoute() {
  return <RoleRoute allowedRoles={['CITIZEN']} />;
}

export function DepartmentRoute() {
  return <RoleRoute allowedRoles={['DEPARTMENT']} />;
}

export function HeadRoute() {
  return <RoleRoute allowedRoles={['HEAD_OF_DEPARTMENTS']} />;
}

export function AdminRoute() {
  return <RoleRoute allowedRoles={['ADMIN']} />;
}

/** @deprecated use UserRoute */
export function CitizenRoute() {
  return <UserRoute />;
}

/** @deprecated department users use DepartmentRoute; head uses HeadRoute */
export function AuthorityRoute() {
  return <RoleRoute allowedRoles={['DEPARTMENT', 'HEAD_OF_DEPARTMENTS']} />;
}

export function GuestRoute() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <LoadingScreen />;
  if (isAuthenticated && user) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
}
