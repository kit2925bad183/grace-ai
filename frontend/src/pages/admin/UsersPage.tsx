import { useCallback, useEffect, useState } from 'react';
import { MoreHorizontal, Shield, UserCheck, UserX, LogOut, Key, Mail } from 'lucide-react';
import {
  listAdminUsers,
  updateUserStatus,
  forceLogoutUser,
  softDeleteUser,
  verifyUserEmail,
  unlockUserAccount,
  type AdminUser,
} from '@/services/adminService';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorState } from '@/components/ui/ErrorState';
import { DashboardSkeleton } from '@/components/skeletons/Skeletons';
import { useSearchParams } from 'react-router-dom';
import { ROLE_LABELS } from '@/types';

const ROLES = ['', 'CITIZEN', 'DEPARTMENT', 'HEAD_OF_DEPARTMENTS', 'ADMIN'] as const;
const STATUSES = ['', 'ACTIVE', 'SUSPENDED', 'DISABLED', 'PENDING'] as const;

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [status, setStatus] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAdminUsers({
        page,
        limit: 20,
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
      });
      setUsers(data.items);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, role, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(action: string, user: AdminUser) {
    setMenuOpen(null);
    setActionMsg('');
    try {
      switch (action) {
        case 'suspend':
          await updateUserStatus(user._id, 'SUSPENDED');
          setActionMsg(`${user.name} suspended.`);
          break;
        case 'activate':
          await updateUserStatus(user._id, 'ACTIVE');
          setActionMsg(`${user.name} activated.`);
          break;
        case 'logout':
          await forceLogoutUser(user._id);
          setActionMsg(`Sessions revoked for ${user.name}.`);
          break;
        case 'verify':
          await verifyUserEmail(user._id);
          setActionMsg(`Email verified for ${user.name}.`);
          break;
        case 'unlock':
          await unlockUserAccount(user._id);
          setActionMsg(`${user.name} unlocked.`);
          break;
        case 'delete':
          if (window.confirm(`Archive ${user.name}? Historical data will be preserved.`)) {
            await softDeleteUser(user._id);
            setActionMsg(`${user.name} archived.`);
          }
          break;
        default:
          break;
      }
      await load();
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : 'Action failed');
    }
  }

  if (loading && !users.length) return <DashboardSkeleton />;
  if (error && !users.length) return <ErrorState title="Unable to load users" message={error} onRetry={load} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="User Management"
        subtitle="Create, monitor, suspend, and manage all platform users."
      />

      {actionMsg && (
        <div className="rounded-xl border border-grace-border bg-grace-sand px-4 py-3 text-sm text-grace-text">
          {actionMsg}
        </div>
      )}

      <div className="card flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search name or email…"
          className="min-h-[44px] flex-1 rounded-xl border border-grace-border px-4 text-sm"
        />
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); setSearchParams(e.target.value ? { role: e.target.value } : {}); }}
          className="min-h-[44px] rounded-xl border border-grace-border px-3 text-sm"
        >
          {ROLES.map((r) => (
            <option key={r || 'all'} value={r}>{r ? ROLE_LABELS[r as keyof typeof ROLE_LABELS] ?? r : 'All roles'}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="min-h-[44px] rounded-xl border border-grace-border px-3 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s || 'all'} value={s}>{s || 'All statuses'}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-grace-border bg-grace-sand/50 text-xs uppercase text-grace-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Login</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grace-border">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-grace-sand/30">
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-grace-muted">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="badge bg-grace-sand text-grace-text">
                    {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-grace-muted">
                  {user.departmentId && typeof user.departmentId === 'object'
                    ? user.departmentId.name
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.status || 'ACTIVE'} />
                </td>
                <td className="px-4 py-3 text-grace-muted">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                </td>
                <td className="relative px-4 py-3">
                  <button
                    type="button"
                    className="rounded-lg p-2 hover:bg-grace-sand"
                    aria-label={`Actions for ${user.name}`}
                    onClick={() => setMenuOpen(menuOpen === user._id ? null : user._id)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {menuOpen === user._id && (
                    <div className="absolute right-4 top-full z-20 min-w-[180px] rounded-xl border border-grace-border bg-white py-1 shadow-lg">
                      <MenuItem icon={UserCheck} label="Activate" onClick={() => handleAction('activate', user)} />
                      <MenuItem icon={UserX} label="Suspend" onClick={() => handleAction('suspend', user)} />
                      <MenuItem icon={LogOut} label="Force Logout" onClick={() => handleAction('logout', user)} />
                      <MenuItem icon={Mail} label="Verify Email" onClick={() => handleAction('verify', user)} />
                      <MenuItem icon={Key} label="Unlock Account" onClick={() => handleAction('unlock', user)} />
                      <MenuItem icon={Shield} label="Archive User" onClick={() => handleAction('delete', user)} danger />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && (
          <p className="p-8 text-center text-sm text-grace-muted">No users match your filters.</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} total={total} limit={20} onPageChange={setPage} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    SUSPENDED: 'bg-yellow-100 text-yellow-800',
    DISABLED: 'bg-red-100 text-red-800',
    PENDING: 'bg-blue-100 text-blue-800',
  };
  return <span className={`badge ${colors[status] ?? 'bg-grace-sand text-grace-text'}`}>{status}</span>;
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-grace-sand ${danger ? 'text-grace-critical' : ''}`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}
