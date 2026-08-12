import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface MobileNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface MobileBottomNavProps {
  items: MobileNavItem[];
  variant?: 'light' | 'dark';
}

export function MobileBottomNav({ items, variant = 'light' }: MobileBottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-grace-border bg-white/95 pb-safe backdrop-blur-md lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'relative flex min-h-[56px] min-w-[56px] flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-medium transition-colors',
                isActive
                  ? variant === 'dark'
                    ? 'text-grace-coffee'
                    : 'text-grace-coffee'
                  : 'text-grace-muted hover:text-grace-text'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                    isActive ? 'bg-grace-sand text-grace-coffee' : 'bg-transparent'
                  )}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {item.badge != null && item.badge > 0 && (
                    <span className="absolute right-2 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-grace-critical px-1 text-[10px] font-bold text-white">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </span>
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
