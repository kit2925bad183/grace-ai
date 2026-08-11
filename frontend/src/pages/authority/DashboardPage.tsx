import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Copy,
  TrendingUp,
} from 'lucide-react';
import { getAuthorityOverview } from '@/services/authorityService';
import { DashboardSkeleton } from '@/components/skeletons/Skeletons';
import { ErrorState } from '@/components/ui/ErrorState';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AuthorityDashboardPage() {
  const [overview, setOverview] = useState<Awaited<ReturnType<typeof getAuthorityOverview>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAuthorityOverview()
      .then(setOverview)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return <ErrorState title="Unable to load dashboard" message={error} onRetry={() => window.location.reload()} />;
  }

  if (!overview) return null;

  const cards = [
    { label: 'Total Grievances', value: overview.totalGrievances, icon: FileText, color: 'text-grace-blue' },
    { label: 'Resolved', value: overview.resolved, icon: CheckCircle2, color: 'text-grace-success' },
    { label: 'In Progress', value: overview.inProgress, icon: Clock, color: 'text-grace-cyan' },
    { label: 'SLA Compliance', value: `${overview.slaCompliance}%`, icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'SLA At Risk', value: overview.slaAtRisk, icon: AlertTriangle, color: 'text-grace-warning' },
    { label: 'Duplicate Complaints', value: overview.duplicateComplaints, icon: Copy, color: 'text-orange-600' },
    { label: 'Avg Resolution (days)', value: overview.averageResolutionTime, icon: Clock, color: 'text-navy-700' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Authority Command Center" subtitle="Real-time grievance management and SLA monitoring" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.label} label={card.label} value={card.value} icon={card.icon} color={card.color} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/authority/grievances" className="card transition-shadow hover:shadow-elevated">
          <h3 className="font-semibold text-navy-900">Manage Grievances</h3>
          <p className="mt-1 text-sm text-navy-500">Search, filter, assign officers, update status</p>
        </Link>
        <Link to="/authority/sla" className="card transition-shadow hover:shadow-elevated">
          <h3 className="font-semibold text-navy-900">SLA Monitoring</h3>
          <p className="mt-1 text-sm text-navy-500">{overview.slaAtRisk} cases at risk</p>
        </Link>
        <Link to="/authority/duplicates" className="card transition-shadow hover:shadow-elevated">
          <h3 className="font-semibold text-navy-900">Duplicate Management</h3>
          <p className="mt-1 text-sm text-navy-500">{overview.duplicateComplaints} potential duplicates</p>
        </Link>
      </div>

      <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50/50 p-8 text-center">
        <p className="text-sm text-navy-500">Advanced analytics available in</p>
        <Link to="/authority/analytics" className="mt-1 inline-block text-sm font-medium text-grace-cyan hover:underline">
          Analytics Intelligence →
        </Link>
      </div>
    </div>
  );
}
