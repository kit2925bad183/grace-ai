import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { useLiveGovernanceStats } from '@/hooks/useLiveGovernanceStats';

export default function StatusPage() {
  const { health, loading: healthLoading, error: healthError, refetch: refetchHealth } = useHealthCheck();
  const { stats, loading: statsLoading, error: statsError, lastUpdated, refetch: refetchStats } =
    useLiveGovernanceStats({ refreshIntervalMs: 30_000 });

  const isHealthy = health?.status === 'ok';
  const refreshing = healthLoading || statsLoading;

  const handleRefresh = () => {
    refetchHealth();
    refetchStats();
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <header className="border-b border-navy-100 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <BrandLogo size="sm" to="/" showTagline={false} />
          <Link to="/" className="text-sm font-medium text-grace-blue hover:underline">
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">System Status</h1>
            <p className="mt-1 text-sm text-navy-600">
              Live health and governance metrics — auto-refreshes every 30 seconds.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary gap-2 text-sm"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
        </div>

        <div className={`card flex items-start gap-4 ${isHealthy ? 'border-emerald-200' : 'border-amber-200'}`}>
          {healthLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-navy-400" />
          ) : isHealthy ? (
            <CheckCircle2 className="h-6 w-6 text-grace-success" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-grace-warning" />
          )}
          <div>
            <p className="font-semibold text-navy-900">
              API {healthLoading ? 'checking…' : isHealthy ? 'Operational' : 'Degraded'}
            </p>
            {healthError && <p className="mt-1 text-sm text-red-600">{healthError}</p>}
            {health && (
              <p className="mt-1 text-sm text-navy-600">
                Database: {health.database}
                {health.version && ` · API v${health.version}`}
              </p>
            )}
          </div>
        </div>

        <section className="card">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-grace-blue" />
            <h2 className="font-semibold text-navy-900">Governance Statistics</h2>
          </div>

          {statsError && (
            <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{statsError}</p>
          )}

          {statsLoading && !stats ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-navy-100" />
              ))}
            </div>
          ) : stats ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="Total Grievances" value={stats.totalGrievances} />
              <Stat label="Resolved" value={stats.resolved} />
              <Stat label="In Progress" value={stats.inProgress} />
              <Stat label="SLA Compliance" value={`${stats.slaCompliance}%`} />
              <Stat label="SLA At Risk" value={stats.slaAtRisk} />
              <Stat label="Avg Resolution" value={`${stats.averageResolutionTime} days`} />
            </div>
          ) : (
            <p className="text-sm text-navy-500">Statistics unavailable.</p>
          )}

          {lastUpdated && (
            <p className="mt-4 text-xs text-navy-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </section>

        <p className="text-center text-xs text-navy-400">
          All values are fetched from the live backend API and MongoDB.
        </p>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-navy-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-navy-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy-900">{value}</p>
    </div>
  );
}
