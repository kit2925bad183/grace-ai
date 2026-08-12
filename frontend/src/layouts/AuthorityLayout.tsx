import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Clock,
  Copy,
  Sparkles,
  User,
  LogOut,
  X,
  Menu,
  BarChart3,
  MapPin,
  Scale,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { cn } from '@/utils/cn';
import { usePortalPaths } from '@/utils/portalPaths';
import { ROLE_LABELS } from '@/types';

export default function AuthorityLayout() {
  const { user, logout } = useAuth();
  const paths = usePortalPaths();
  const isHead = user?.role === 'HEAD_OF_DEPARTMENTS';

  const navItems = isHead
    ? [
        { to: paths.dashboard, label: 'Command Center', icon: LayoutDashboard },
        { to: paths.complaints, label: 'All Complaints', icon: FileText },
        { to: paths.sla, label: 'SLA Intelligence', icon: Clock },
        { to: paths.duplicates, label: 'Duplicates', icon: Copy },
        { to: paths.analytics, label: 'Analytics', icon: BarChart3 },
        { to: paths.hotspots, label: 'Hotspots', icon: MapPin },
        { to: paths.insights, label: 'Root Causes', icon: Sparkles },
        { to: paths.policyImpact, label: 'Policy Impact', icon: Scale },
        { to: paths.profile, label: 'Profile', icon: User },
      ]
    : [
        { to: paths.dashboard, label: 'Dashboard', icon: LayoutDashboard },
        { to: paths.complaints, label: 'Complaints', icon: FileText },
        { to: paths.sla, label: 'SLA Monitoring', icon: Clock },
        { to: paths.duplicates, label: 'Duplicates', icon: Copy },
        { to: paths.analytics, label: 'Analytics', icon: BarChart3 },
        { to: paths.profile, label: 'Profile', icon: User },
      ];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const portalTitle = isHead ? 'GRACE AI Command Center' : 'Department Command Center';

  return (
    <div className="flex min-h-screen bg-grace-sand">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-grace-text/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-grace-coffee text-white transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <BrandLogo size="sm" showTagline={false} variant="dark" />
          <button type="button" className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-grace-sand/80">
          {isHead ? ROLE_LABELS.HEAD_OF_DEPARTMENTS : ROLE_LABELS.DEPARTMENT}
          {user?.departmentName ? ` · ${user.departmentName}` : ''}
        </p>
        <nav className="flex-1 space-y-0.5 px-3 pb-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn('sidebar-nav-item', isActive && 'sidebar-nav-active !text-white')
              }
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-white/60">{user?.email}</p>
          <button type="button" onClick={() => logout()} className="mt-3 flex items-center gap-2 text-sm text-white/60 hover:text-red-300">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-[56px] items-center border-b border-grace-border bg-white px-4 lg:px-8">
          <button type="button" className="mr-3 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6 text-grace-coffee" />
          </button>
          <div>
            <p className="text-sm font-semibold text-grace-text lg:text-base">{portalTitle}</p>
            {isHead && (
              <p className="text-xs text-grace-muted">Government Grievance Intelligence</p>
            )}
          </div>
        </header>
        <main className="flex-1 pb-24 lg:pb-8">
          <div className="authority-shell">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav items={navItems.slice(0, 5)} variant="dark" />
    </div>
  );
}
