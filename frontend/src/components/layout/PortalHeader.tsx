import { Link } from 'react-router-dom';
import { Bell, LogOut, Menu, Shield, User } from 'lucide-react';
import type { AuthUser } from '@/types';

interface PortalHeaderProps {
  portalLabel: string;
  roleLabel: string;
  user: AuthUser | null;
  unreadCount?: number;
  notificationsPath: string;
  onMenuClick: () => void;
  onLogout: () => void;
}

export function PortalHeader({
  portalLabel,
  roleLabel,
  user,
  unreadCount = 0,
  notificationsPath,
  onMenuClick,
  onLogout,
}: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-1.5 text-navy-700 hover:bg-navy-50 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <Shield className="h-4 w-4 text-grace-cyan" aria-hidden="true" />
          <span className="text-sm font-bold text-navy-900">GRACE AI</span>
        </div>
        <span className="hidden text-navy-300 sm:inline" aria-hidden="true">|</span>
        <p className="text-sm font-medium text-navy-600">{portalLabel}</p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to={notificationsPath}
          className="relative rounded-lg p-2 text-navy-600 hover:bg-navy-50"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100">
            <User className="h-4 w-4 text-navy-600" aria-hidden="true" />
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-navy-900">{user?.name}</p>
            <p className="text-[10px] uppercase tracking-wide text-navy-500">{roleLabel}</p>
          </div>
        </div>
        <span className="rounded-full bg-grace-blue/10 px-2.5 py-0.5 text-xs font-medium text-grace-blue md:hidden">
          {roleLabel}
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg p-2 text-navy-500 hover:bg-red-50 hover:text-red-600"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
