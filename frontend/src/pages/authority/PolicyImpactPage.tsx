import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPolicyImpactAnalytics } from '@/services/analyticsService';
import type { PolicyImpactItem } from '@/types/analytics';
import { ChartSkeleton } from '@/components/skeletons/Skeletons';

export default function PolicyImpactPage() {
  const [policies, setPolicies] = useState<PolicyImpactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPolicyImpactAnalytics()
      .then(setPolicies)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ChartSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Policy Impact Analysis</h1>
        <p className="mt-1 text-sm text-navy-500">
          Seeded Demo Policy Data · retrieved from MongoDB PolicyImpact records
        </p>
        <Link to="/authority/analytics" className="mt-2 inline-block text-sm text-grace-cyan hover:underline">
          View full analytics dashboard →
        </Link>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      {!policies.length ? (
        <div className="card py-12 text-center text-navy-500">No policy impact records available.</div>
      ) : (
        <div className="space-y-4">
          {policies.map((p) => (
            <div key={p._id} className="rounded-xl border border-navy-100 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-navy-900">{p.policyName}</h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  {p.label}
                </span>
              </div>
              <p className="mt-2 text-sm text-navy-600">{p.description}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="Before (complaints/mo)" value={String(p.beforeComplaintsPerMonth)} />
                <Metric label="After (complaints/mo)" value={String(p.afterComplaintsPerMonth)} />
                <Metric
                  label="Complaint Change"
                  value={`${p.complaintChangePercent > 0 ? '+' : ''}${p.complaintChangePercent}%`}
                  highlight={p.complaintChangePercent < 0 ? 'positive' : 'negative'}
                />
                <Metric label="SLA Before → After" value={`${p.slaBefore}% → ${p.slaAfter}%`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'positive' | 'negative';
}) {
  return (
    <div className="rounded-lg bg-navy-50/80 p-3">
      <p className="text-xs text-navy-500">{label}</p>
      <p
        className={`mt-1 text-lg font-bold ${
          highlight === 'positive' ? 'text-emerald-600' : highlight === 'negative' ? 'text-red-600' : 'text-navy-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
