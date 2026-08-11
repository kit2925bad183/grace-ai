import { Outlet, useNavigate } from 'react-router-dom';
import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PhasePlaceholder from '@/components/PhasePlaceholder';

export function OfficerDashboardPage() {
  return (
    <PhasePlaceholder
      title="Officer Dashboard"
      description="View and manage assigned grievances in your ward."
      phase="Coming in Phase 5"
    />
  );
}

export function AdminSystemDataPage() {
  return (
    <PhasePlaceholder
      title="System Data"
      description="Admin view of latest database records and system counts."
      phase="Coming in Phase 7"
    />
  );
}

export function OfficerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-50">
      <header className="flex items-center justify-between border-b border-navy-100 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900">
            <Shield className="h-4 w-4 text-grace-cyan" />
          </div>
          <div>
            <p className="text-sm font-bold text-navy-900">GRACE AI</p>
            <p className="text-xs text-navy-500">Officer Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-navy-600">{user?.name}</span>
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="flex items-center gap-1 text-sm text-navy-600 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-50">
      <header className="flex items-center justify-between border-b border-navy-100 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900">
            <Shield className="h-4 w-4 text-grace-cyan" />
          </div>
          <div>
            <p className="text-sm font-bold text-navy-900">GRACE AI</p>
            <p className="text-xs text-navy-500">Admin Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-navy-600">{user?.name}</span>
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="flex items-center gap-1 text-sm text-navy-600 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
