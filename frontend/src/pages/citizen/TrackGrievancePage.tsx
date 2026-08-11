import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  getGrievanceDetails,
  getGrievanceTimeline,
  getGrievanceSla,
} from '@/services/grievanceService';
import type { GrievanceDetailResponse, StatusHistoryItem, SLAPrediction } from '@/types/grievance';
import { TimelineSkeleton } from '@/components/skeletons/Skeletons';
import {
  StatusBadge,
  PriorityBadge,
  SlaRiskBadge,
  formatDate,
  formatDateTime,
} from '@/components/grievance/GrievanceBadges';

export default function TrackGrievancePage() {
  const { grievanceId } = useParams<{ grievanceId: string }>();
  const [detail, setDetail] = useState<GrievanceDetailResponse | null>(null);
  const [timeline, setTimeline] = useState<StatusHistoryItem[]>([]);
  const [sla, setSla] = useState<SLAPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!grievanceId) return;
    Promise.all([
      getGrievanceDetails(grievanceId),
      getGrievanceTimeline(grievanceId),
      getGrievanceSla(grievanceId),
    ])
      .then(([d, t, s]) => {
        setDetail(d);
        setTimeline(t);
        setSla(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Complaint not found.'))
      .finally(() => setLoading(false));
  }, [grievanceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-50 p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-navy-100" />
          <div className="h-48 animate-pulse rounded-xl bg-navy-100" />
          <TimelineSkeleton />
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50 p-6">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error || 'Complaint not found.'}
          <Link to="/login" className="mt-4 block text-grace-blue hover:underline">Sign in to track</Link>
        </div>
      </div>
    );
  }

  const g = detail.grievance;

  return (
    <div className="min-h-screen bg-navy-50">
      <header className="border-b border-navy-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/citizen/dashboard" className="inline-flex items-center gap-1 text-sm text-grace-blue hover:underline">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="font-mono text-sm font-semibold text-navy-900">{g.grievanceId}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <div className="card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-navy-900">{g.title}</h1>
              <p className="mt-1 text-sm text-navy-600">{g.departmentId.name}</p>
            </div>
            <StatusBadge status={g.status} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-navy-500">Priority</p>
              <PriorityBadge priority={g.priority} />
            </div>
            <div>
              <p className="text-xs text-navy-500">SLA Risk</p>
              <SlaRiskBadge risk={sla?.riskLevel} />
            </div>
            <div>
              <p className="text-xs text-navy-500">SLA Deadline</p>
              <p className="text-sm font-medium">{formatDate(g.slaDeadline)}</p>
            </div>
            <div>
              <p className="text-xs text-navy-500">Officer</p>
              <p className="text-sm font-medium">
                {g.assignedOfficerId?.userId?.name ?? 'Not yet assigned'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 font-semibold text-navy-900">Status Timeline</h2>
          {timeline.length === 0 ? (
            <TimelineSkeleton />
          ) : (
            <div className="relative space-y-0 pl-6">
              <div className="absolute bottom-2 left-[11px] top-2 w-0.5 bg-navy-200" />
              {timeline.map((item, i) => (
                <div key={item._id} className="relative pb-5">
                  <div className="absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border-2 border-grace-cyan bg-grace-cyan text-xs text-white">
                    {i < timeline.length - 1 ? '✓' : '●'}
                  </div>
                  <p className="font-medium text-navy-900">{item.newStatus.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-navy-500">{formatDateTime(item.createdAt)}</p>
                  {item.comment && <p className="mt-1 text-sm text-navy-600">{item.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {sla && (
          <div className="card text-sm">
            <p className="font-medium text-navy-900">SLA Recommendation</p>
            <p className="mt-1 text-navy-600">{sla.recommendation}</p>
          </div>
        )}
      </main>
    </div>
  );
}
