import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Lock, LogIn } from 'lucide-react';
import {
  getSecurityDashboard,
  listSecurityEvents,
  type SecurityEventItem,
} from '@/services/adminService';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { DashboardSkeleton } from '@/components/skeletons/Skeletons';
import { Pagination } from '@/components/ui/Pagination';

export default function SecurityPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getSecurityDashboard>> | null>(null);
  const [events, setEvents] = useState<SecurityEventItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getSecurityDashboard(),
      listSecurityEvents({ page, limit: 20 }),
    ])
      .then(([dash, ev]) => {
        setStats(dash);
        setEvents(ev.items);
        setTotal(ev.pagination.total);
        setTotalPages(ev.pagination.totalPages);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load security data'))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState title="Security Center unavailable" message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Security Center"
        subtitle="Monitor login activity, failed attempts, and platform security events."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={LogIn} label="Logins (24h)" value={stats?.successfulLogins ?? 0} />
        <StatCard icon={AlertTriangle} label="Failed Logins (24h)" value={stats?.failedLogins ?? 0} accent />
        <StatCard icon={Lock} label="Locked Accounts (24h)" value={stats?.lockedAccounts ?? 0} />
        <StatCard icon={Shield} label="Suspicious (24h)" value={stats?.suspicious ?? 0} accent />
      </div>

      <section className="card overflow-x-auto p-0">
        <div className="border-b border-grace-border px-4 py-3">
          <h2 className="font-semibold text-grace-text">Security Events</h2>
        </div>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-grace-sand/50 text-xs uppercase text-grace-muted">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grace-border">
            {events.map((ev) => (
              <tr key={ev._id}>
                <td className="px-4 py-3 font-medium">{ev.eventType.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 text-grace-muted">
                  {ev.userId && typeof ev.userId === 'object'
                    ? `${ev.userId.name} (${ev.userId.email})`
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <SeverityBadge severity={ev.severity} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-grace-muted">{ev.ipAddress || '—'}</td>
                <td className="px-4 py-3 text-grace-muted">
                  {new Date(ev.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!events.length && (
          <p className="p-8 text-center text-sm text-grace-muted">No security events recorded yet.</p>
        )}
      </section>

      <Pagination page={page} totalPages={totalPages} total={total} limit={20} onPageChange={setPage} />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="card flex items-center gap-3 py-4">
      <div className={`rounded-xl p-2 ${accent ? 'bg-red-100 text-red-700' : 'bg-grace-sand text-grace-coffee'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={`text-2xl font-bold ${accent ? 'text-grace-critical' : 'text-grace-text'}`}>{value}</p>
        <p className="text-xs text-grace-muted">{label}</p>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };
  return <span className={`badge ${map[severity] ?? map.LOW}`}>{severity}</span>;
}
