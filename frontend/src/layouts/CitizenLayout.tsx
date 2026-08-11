import { NavLink, Outlet } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  FilePlus,
  FileText,
  Bell,
  User,
  LogOut,
  X,
  MapPin,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount } from '@/services/notificationService';
import { PortalHeader } from '@/components/layout/PortalHeader';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/citizen/register', label: 'Register Grievance', icon: FilePlus },
  { to: '/citizen/complaints', label: 'My Complaints', icon: FileText },
  { to: '/citizen/track', label: 'Track Complaint', icon: MapPin },
  { to: '/citizen/notifications', label: 'Notifications', icon: Bell, showBadge: true },
  { to: '/citizen/profile', label: 'Profile', icon: User },
];

export default function CitizenLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = () => {
    getUnreadCount()
      .then(setUnreadCount)
      .catch(() => setUnreadCount(0));
  };

  useEffect(() => {
    refreshUnread();
    const interval = setInterval(refreshUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex min-h-screen bg-navy-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-navy-100 bg-white transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Citizen navigation"
      >
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900">
              <Shield className="h-4 w-4 text-grace-cyan" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-navy-900">GRACE AI</p>
              <p className="text-xs text-navy-500">Citizen Portal</p>
            </div>
          </div>
          <button type="button" className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5 text-navy-600" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-grace-blue/30',
                  isActive
                    ? 'bg-grace-blue/10 text-grace-blue'
                    : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                )
              }
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.showBadge && unreadCount > 0 && (
                <span className="rounded-full bg-grace-critical px-2 py-0.5 text-xs font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-navy-100 p-4">
          <div className="mb-3 rounded-lg bg-navy-50 px-3 py-2">
            <p className="text-sm font-medium text-navy-900">{user?.name}</p>
            <p className="text-xs text-navy-500">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalHeader
          portalLabel="Citizen Portal"
          roleLabel="CITIZEN"
          user={user}
          unreadCount={unreadCount}
          notificationsPath="/citizen/notifications"
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
