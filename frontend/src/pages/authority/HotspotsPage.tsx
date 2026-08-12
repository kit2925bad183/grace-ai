import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { getHotspotAnalytics } from '@/services/analyticsService';
import type { HotspotAnalytics } from '@/types/analytics';
import { HotspotSkeleton } from '@/components/skeletons/Skeletons';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { usePortalPaths } from '@/utils/portalPaths';

export default function HotspotsPage() {
  const paths = usePortalPaths();
  const [hotspots, setHotspots] = useState<HotspotAnalytics[]>([]);
  const [selected, setSelected] = useState<HotspotAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getHotspotAnalytics()
      .then(setHotspots)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <HotspotSkeleton />;
  if (error) return <ErrorState title="Unable to load hotspots" message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Ward Hotspots"
        subtitle="Live complaint density and SLA risk by ward — from MongoDB analytics."
        actions={
          <Link to={paths.analytics} className="btn-secondary text-sm">
            Full Analytics
          </Link>
        }
      />

      {hotspots.length === 0 ? (
        <div className="card py-16 text-center text-navy-500">No ward hotspot data available yet.</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotspots.map((w) => (
              <button
                key={w.wardId}
                type="button"
                onClick={() => setSelected(w)}
                className={`card-interactive text-left ${
                  w.intensity === 'HIGH'
                    ? 'border-red-200 bg-red-50/50'
                    : w.intensity === 'MEDIUM'
                      ? 'border-amber-200 bg-amber-50/50'
                      : 'border-emerald-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className={`h-5 w-5 shrink-0 ${w.intensity === 'HIGH' ? 'text-red-600' : w.intensity === 'MEDIUM' ? 'text-amber-600' : 'text-grace-success'}`} />
                  <div>
                    <p className="font-semibold text-navy-900">{w.wardName}</p>
                    <p className="metric-value mt-1 text-2xl">{w.complaintCount}</p>
                    <p className="text-xs text-navy-500">{w.activityLabel} · Top: {w.topCategory}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="card border-grace-cyan/20">
              <h3 className="text-lg font-semibold text-navy-900">{selected.wardName} — Detail</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Complaints" value={selected.complaintCount} />
                <Stat label="Top Category" value={selected.topCategory} />
                <Stat label="Avg Resolution" value={`${selected.averageResolutionTime} days`} />
                <Stat label="SLA Compliance" value={`${selected.slaCompliance}%`} />
                <Stat label="High Priority" value={selected.highPriorityCount} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-navy-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-navy-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-navy-900">{value}</p>
    </div>
  );
}
