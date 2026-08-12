import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCog,
  FileText,
  Clock,
  Copy,
  BarChart3,
  MapPin,
  Brain,
  Bell,
  ScrollText,
  Settings,
  Activity,
  LogOut,
  Menu,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { GlobalSearch } from '@/components/admin/GlobalSearch';
import { CommandPalette } from '@/components/admin/CommandPalette';
import { cn } from '@/utils/cn';

const navSections = [
  {
    title: 'Overview',
    items: [
      { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Users',
    items: [
      { to: 'users', label: 'All Users', icon: Users },
      { to: 'department-heads', label: 'Department Heads', icon: UserCog },
      { to: 'department-users', label: 'Department Users', icon: Users },
    ],
  },
  {
    title: 'Organization',
    items: [
      { to: 'departments', label: 'Departments', icon: Building2 },
    ],
  },
  {
    title: 'Complaints',
    items: [
      { to: 'complaints', label: 'All Complaints', icon: FileText },
      { to: 'sla', label: 'SLA Monitoring', icon: Clock },
      { to: 'duplicates', label: 'Duplicate Intelligence', icon: Copy },
    ],
  },
  {
    title: 'AI & Analytics',
    items: [
      { to: 'analytics', label: 'Analytics', icon: BarChart3 },
      { to: 'hotspots', label: 'Hotspots', icon: MapPin },
      { to: 'insights', label: 'Root Cause Intelligence', icon: Brain },
      { to: 'policy-impact', label: 'Policy Impact', icon: ScrollText },
    ],
  },
  {
    title: 'System',
    items: [
      { to: 'security', label: 'Security Center', icon: ShieldAlert },
      { to: 'audit-logs', label: 'Audit Logs', icon: Shield },
      { to: 'notifications', label: 'Notifications', icon: Bell },
      { to: 'settings', label: 'System Settings', icon: Settings },
      { to: 'health', label: 'Platform Health', icon: Activity },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-grace-sand">
      <CommandPalette />
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-grace-text/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-grace-coffee text-white transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-lg font-bold">GRACE AI</p>
          <p className="text-xs text-white/70">Platform Administration</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {navSections.map((section) => (
            <div key={section.title} className="mb-4">
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {section.title}
              </p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={`/admin/${item.to}`}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn('sidebar-nav-item mb-0.5', isActive && 'sidebar-nav-active')
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-white/60">{user?.email}</p>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-3 flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 text-sm text-white/80 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-[56px] flex-wrap items-center justify-between gap-3 border-b border-grace-border bg-white px-4 py-2 lg:px-8">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSidebarOpen(true)} className="min-h-[44px] min-w-[44px] rounded-lg p-2 lg:hidden" aria-label="Open menu">
              <Menu className="h-6 w-6 text-grace-coffee" />
            </button>
            <p className="hidden text-sm font-semibold text-grace-text lg:block">GRACE AI Command Center</p>
            <BrandLogo size="sm" showTagline={false} className="lg:hidden" to="/admin/dashboard" />
          </div>
          <GlobalSearch className="hidden sm:block" />
          <div className="flex items-center gap-3">
            <kbd className="hidden rounded-lg border border-grace-border bg-grace-sand px-2 py-1 text-xs text-grace-muted lg:inline">Ctrl+K</kbd>
            <NavLink to="/admin/profile" className="text-sm font-medium text-grace-coffee hover:underline">Profile</NavLink>
          </div>
        </header>

        <main className="flex-1 pb-8">
          <div className="authority-shell">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
