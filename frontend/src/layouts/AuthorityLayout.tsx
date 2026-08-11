import { NavLink, Outlet } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  FileText,
  Clock,
  Copy,
  BarChart3,
  Bell,
  LogOut,
  X,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount } from '@/services/notificationService';
import { PortalHeader } from '@/components/layout/PortalHeader';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/authority/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { to: '/authority/grievances', label: 'Grievances', icon: FileText },
  { to: '/authority/sla', label: 'SLA Monitoring', icon: Clock },
  { to: '/authority/duplicates', label: 'Duplicates', icon: Copy },
  { to: '/authority/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/authority/notifications', label: 'Notifications', icon: Bell, showBadge: true },
  { to: '/authority/profile', label: 'Profile', icon: User },
];

export default function AuthorityLayout() {
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
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-navy-100 bg-navy-950 text-white transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Authority navigation"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <Shield className="h-4 w-4 text-grace-cyan" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold">GRACE AI</p>
              <p className="text-xs text-navy-400">Authority Portal</p>
            </div>
          </div>
          <button type="button" className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
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
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-grace-cyan/30',
                  isActive
                    ? 'bg-grace-cyan/20 text-grace-cyan'
                    : 'text-navy-300 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.showBadge && unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-lg bg-white/5 px-3 py-2">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-navy-400">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-300 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalHeader
          portalLabel="Authority Command Center"
          roleLabel={user?.role ?? 'AUTHORITY'}
          user={user}
          unreadCount={unreadCount}
          notificationsPath="/authority/notifications"
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
