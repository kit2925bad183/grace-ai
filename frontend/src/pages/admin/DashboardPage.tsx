import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, UserCog, Users, Shield, Settings } from 'lucide-react';
import { getPlatformStats, type PlatformStats } from '@/services/adminService';
import { DashboardSkeleton } from '@/components/skeletons/Skeletons';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlatformStats()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState title="Unable to load platform stats" message={error} onRetry={() => window.location.reload()} />;
  if (!stats) return null;

  const attention = stats.attentionRequired;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="GRACE AI Command Center"
        subtitle="Complete platform control and governance intelligence."
      />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-grace-muted">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/departments" className="btn-primary inline-flex gap-2"><Building2 className="h-4 w-4" /> Create Department</Link>
          <Link to="/admin/department-heads" className="btn-outline inline-flex gap-2"><UserCog className="h-4 w-4" /> Create Department Head</Link>
          <Link to="/admin/department-users" className="btn-outline inline-flex gap-2"><Users className="h-4 w-4" /> Create Department User</Link>
          <Link to="/admin/complaints?priority=CRITICAL" className="btn-ghost">Critical Complaints</Link>
          <Link to="/admin/security" className="btn-ghost inline-flex gap-2"><Shield className="h-4 w-4" /> Security Events</Link>
          <Link to="/admin/settings" className="btn-ghost inline-flex gap-2"><Settings className="h-4 w-4" /> Platform Settings</Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-grace-muted">Platform Statistics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Stat label="Total Users" value={stats.totalUsers} />
          <Stat label="Citizens" value={stats.totalCitizens} />
          <Stat label="Departments" value={stats.totalDepartments} />
          <Stat label="Dept Users" value={stats.departmentUsers} />
          <Stat label="Dept Heads" value={stats.departmentHeads} />
          <Stat label="Administrators" value={stats.totalAdmins} />
          <Stat label="Total Complaints" value={stats.totalComplaints} />
          <Stat label="Active" value={stats.activeComplaints} />
          <Stat label="Resolved" value={stats.resolvedComplaints} />
          <Stat label="Critical" value={stats.criticalComplaints} accent="text-grace-critical" />
          <Stat label="SLA At Risk" value={stats.slaAtRisk} accent="text-grace-warning" />
          <Stat label="SLA Breached" value={stats.slaBreached} accent="text-grace-critical" />
          <Stat label="Duplicate Clusters" value={stats.duplicateClusters} />
          <Stat label="SLA Compliance" value={`${stats.slaCompliance}%`} />
          <Stat label="Avg Resolution" value={`${stats.averageResolutionTime}h`} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-grace-text">What needs attention?</h2>
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

function Stat({ label, value, accent = 'text-grace-text' }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="card py-4 text-center">
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      <p className="mt-1 text-xs text-grace-muted">{label}</p>
    </div>
  );
}

function Alert({ text }: { text: string }) {
  return (
    <div className="card flex items-start gap-2 border-grace-warning/30 bg-grace-sand/50">
      <span aria-hidden="true">⚠</span>
      <p className="text-sm text-grace-text">{text}</p>
    </div>
  );
}
