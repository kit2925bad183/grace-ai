import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Shield,
  Settings,
  Search,
  UserCog,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const actions = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, keywords: 'home command center' },
  { label: 'All Users', path: '/admin/users', icon: Users, keywords: 'users citizens' },
  { label: 'Create Department', path: '/admin/departments', icon: Building2, keywords: 'department create' },
  { label: 'Create Department Head', path: '/admin/department-heads', icon: UserCog, keywords: 'head create' },
  { label: 'All Complaints', path: '/admin/complaints', icon: FileText, keywords: 'grievances complaints' },
  { label: 'Critical Complaints', path: '/admin/complaints?priority=CRITICAL', icon: FileText, keywords: 'critical urgent' },
  { label: 'Security Center', path: '/admin/security', icon: Shield, keywords: 'security login events' },
  { label: 'System Settings', path: '/admin/settings', icon: Settings, keywords: 'settings maintenance' },
  { label: 'Analytics', path: '/admin/analytics', icon: LayoutDashboard, keywords: 'analytics trends' },
];

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const toggle = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setOpen((v) => !v);
      setQuery('');
    }
    if (e.key === 'Escape') setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', toggle);
    return () => window.removeEventListener('keydown', toggle);
  }, [toggle]);

  const filtered = actions.filter((a) => {
    const q = query.toLowerCase();
    return (
      !q ||
      a.label.toLowerCase().includes(q) ||
      a.keywords.toLowerCase().includes(q)
    );
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-grace-text/50 p-4 pt-[15vh]">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-grace-border bg-white shadow-2xl"
        role="dialog"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-2 border-b border-grace-border px-4">
          <Search className="h-5 w-5 text-grace-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions… (Ctrl+K)"
            className="min-h-[52px] flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="hidden rounded bg-grace-sand px-2 py-0.5 text-xs text-grace-muted sm:inline">Esc</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {filtered.map((action) => (
            <li key={action.path}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-grace-sand'
                )}
                onClick={() => {
                  navigate(action.path);
                  setOpen(false);
                }}
              >
                <action.icon className="h-4 w-4 text-grace-coffee" />
                {action.label}
              </button>
            </li>
          ))}
          {!filtered.length && (
            <li className="px-3 py-4 text-sm text-grace-muted">No matching actions</li>
          )}
        </ul>
      </div>
      <button type="button" className="absolute inset-0 -z-10" aria-label="Close" onClick={() => setOpen(false)} />
    </div>
  );
}
