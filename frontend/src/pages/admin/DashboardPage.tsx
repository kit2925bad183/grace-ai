import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Building2, UserCog, Users, Shield, Settings } from 'lucide-react';
import { getPlatformStats, type PlatformStats } from '@/services/adminService';
import { getAnalyticsTrends, getCategoryAnalytics } from '@/services/analyticsService';
import { DashboardSkeleton } from '@/components/skeletons/Skeletons';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';

const CHART_COLORS = ['#0F766E', '#14B8A6', '#06B6D4', '#22C55E', '#F59E0B', '#64748B'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [trends, setTrends] = useState<Array<{ period: string; count: number }>>([]);
  const [categories, setCategories] = useState<Array<{ name: string; value: number }>>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getPlatformStats(), getAnalyticsTrends(), getCategoryAnalytics()])
      .then(([s, t, c]) => {
        if (s.status === 'fulfilled') setStats(s.value);
        else setError(s.reason instanceof Error ? s.reason.message : 'Failed to load');
        if (t.status === 'fulfilled') setTrends(t.value.trends.slice(-6));
        if (c.status === 'fulfilled') {
          setCategories(
            c.value.categories.slice(0, 6).map((cat) => ({
              name: cat.categoryName.length > 14 ? `${cat.categoryName.slice(0, 12)}…` : cat.categoryName,
              value: cat.complaintCount,
            }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState title="Unable to load platform stats" message={error} onRetry={() => window.location.reload()} />;
  if (!stats) return null;

  const attention = stats.attentionRequired;
  const statusPie = [
    { name: 'Active', value: stats.activeComplaints },
    { name: 'Resolved', value: stats.resolvedComplaints },
    { name: 'Critical', value: stats.criticalComplaints },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="GRACE AI Command Center"
        subtitle="AI-Powered Grievance Redressal and Citizen Engagement Platform"
      />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-civic-muted">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/departments" className="btn-primary inline-flex gap-2"><Building2 className="h-4 w-4" /> Create Department</Link>
          <Link to="/admin/department-heads" className="btn-outline inline-flex gap-2"><UserCog className="h-4 w-4" /> Create Department Head</Link>
          <Link to="/admin/department-users" className="btn-outline inline-flex gap-2"><Users className="h-4 w-4" /> Create Department User</Link>
          <Link to="/admin/complaints?priority=CRITICAL" className="btn-ghost">Critical Complaints</Link>
          <Link to="/admin/analytics" className="btn-ghost">Full Analytics</Link>
          <Link to="/admin/security" className="btn-ghost inline-flex gap-2"><Shield className="h-4 w-4" /> Security Events</Link>
          <Link to="/admin/settings" className="btn-ghost inline-flex gap-2"><Settings className="h-4 w-4" /> Platform Settings</Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-civic-muted">Overview</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Total Grievances" value={stats.totalComplaints} />
          <Stat label="Active" value={stats.activeComplaints} accent="text-civic-info" />
          <Stat label="Resolved" value={stats.resolvedComplaints} accent="text-civic-success" />
          <Stat label="Critical" value={stats.criticalComplaints} accent="text-civic-critical" />
          <Stat label="SLA At Risk" value={stats.slaAtRisk} accent="text-civic-warning" />
          <Stat label="Duplicates" value={stats.duplicateClusters} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="font-semibold text-civic-text">Monthly Grievance Trends</h3>
          <p className="text-xs text-civic-muted">Live data from MongoDB</p>
          <div className="mt-4 h-56 w-full min-w-0">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0F766E" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-civic-muted">No trend data yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-civic-text">Complaints by Category</h3>
          <p className="text-xs text-civic-muted">Top categories</p>
          <div className="mt-4 h-56 w-full min-w-0">
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#14B8A6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-civic-muted">No category data yet</p>
            )}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-civic-text">Resolution Status Distribution</h3>
          <div className="mt-4 h-52 w-full min-w-0">
            {statusPie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusPie.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-civic-muted">No grievance data yet</p>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-civic-text">What needs attention?</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Alert text={`${attention?.criticalSla ?? stats.slaAtRisk} complaints may need urgent SLA attention.`} />
          <Alert text={`${attention?.unassigned ?? 0} complaints are unassigned.`} />
          <Alert text={`${attention?.duplicateClusters ?? stats.duplicateClusters} duplicate clusters require review.`} />
          <Alert text={`${attention?.departmentsNeedingAttention ?? 0} departments need attention.`} />
          <Alert text={`${stats.suspendedUsers} accounts are suspended or disabled.`} />
          <Alert text={`${stats.slaBreached} complaints have breached SLA deadlines.`} />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent = 'text-civic-text' }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="card py-4 text-center">
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      <p className="mt-1 text-xs text-civic-muted">{label}</p>
    </div>
  );
}

function Alert({ text }: { text: string }) {
  return (
    <div className="card flex items-start gap-2 border-civic-warning/30 bg-amber-50/50">
      <span aria-hidden="true">⚠</span>
      <p className="text-sm text-civic-text">{text}</p>
    </div>
  );
}
