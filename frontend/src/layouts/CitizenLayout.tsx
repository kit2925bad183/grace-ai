import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Search,
  Bell,
  HelpCircle,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount } from '@/services/notificationService';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { cn } from '@/utils/cn';
import { usePortalPaths } from '@/utils/portalPaths';
import { ROLE_LABELS } from '@/types';

export default function CitizenLayout() {
  const { user, logout } = useAuth();
  const paths = usePortalPaths();
  const navItems = [
    { to: paths.dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { to: paths.complaintNew, label: 'New Complaint', icon: PlusCircle },
    { to: paths.complaints, label: 'My Complaints', icon: FileText },
    { to: paths.track, label: 'Track', icon: Search },
    { to: paths.notifications, label: 'Notifications', icon: Bell, badge: true },
    { to: paths.help, label: 'Help', icon: HelpCircle },
    { to: paths.profile, label: 'Profile', icon: User },
  ];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const refresh = () => getUnreadCount().then(setUnreadCount).catch(() => setUnreadCount(0));
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, []);

  const mobileNav = [
    { to: paths.dashboard, label: 'Home', icon: LayoutDashboard },
    { to: paths.complaints, label: 'Complaints', icon: FileText },
    { to: paths.complaintNew, label: 'Report', icon: PlusCircle },
    { to: paths.notifications, label: 'Alerts', icon: Bell, badge: true },
    { to: paths.profile, label: 'Profile', icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-grace-sand">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-grace-text/30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-grace-border bg-white transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Citizen navigation"
      >
        <div className="flex items-center justify-between border-b border-grace-border px-5 py-4">
          <BrandLogo size="sm" to={paths.dashboard} showTagline={false} />
          <button type="button" className="min-h-[44px] min-w-[44px] lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
        </div>

        <p className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-grace-muted">
          {ROLE_LABELS.CITIZEN} Portal
        </p>

        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-grace-sand text-grace-coffee'
                    : 'text-grace-muted hover:bg-grace-sand hover:text-grace-text'
                )
              }
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.badge && unreadCount > 0 && (
                <span className="rounded-full bg-grace-critical px-2 py-0.5 text-xs font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-grace-border p-4">
          <p className="text-sm font-medium text-grace-text">{user?.name}</p>
          <p className="text-xs text-grace-muted">{user?.email}</p>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-3 flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 text-sm text-grace-muted hover:bg-red-50 hover:text-grace-critical"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-[56px] items-center justify-between border-b border-grace-border bg-white px-4 lg:px-8">
          <button type="button" onClick={() => setSidebarOpen(true)} className="min-h-[44px] min-w-[44px] rounded-lg p-2 lg:hidden" aria-label="Open menu">
            <Menu className="h-6 w-6 text-grace-text" />
          </button>
          <p className="hidden text-sm font-semibold text-grace-text lg:block">GRACE AI — Citizen Services</p>
          <BrandLogo size="sm" showTagline={false} className="lg:hidden" />
          <NavLink to={paths.notifications} className="relative rounded-lg p-2 hover:bg-grace-sand" aria-label="Notifications">
            <Bell className="h-5 w-5 text-grace-coffee" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-grace-critical" />
            )}
          </NavLink>
        </header>

        <main className="flex-1 pb-24 lg:pb-8">
          <div className="page-shell">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav
        items={mobileNav.map((item) => ({
          ...item,
          badge: item.badge ? unreadCount : undefined,
        }))}
      />
    </div>
  );
}
