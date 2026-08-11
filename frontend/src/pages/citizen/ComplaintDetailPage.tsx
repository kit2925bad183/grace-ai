import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  getGrievanceDetails,
  getGrievanceTimeline,
} from '@/services/grievanceService';
import type { GrievanceDetailResponse, StatusHistoryItem } from '@/types/grievance';
import { TimelineSkeleton } from '@/components/skeletons/Skeletons';
import {
  StatusBadge,
  PriorityBadge,
  SlaRiskBadge,
  formatDate,
  formatDateTime,
} from '@/components/grievance/GrievanceBadges';

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<GrievanceDetailResponse | null>(null);
  const [timeline, setTimeline] = useState<StatusHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([getGrievanceDetails(id), getGrievanceTimeline(id)])
      .then(([d, t]) => {
        setDetail(d);
        setTimeline(t);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Failed to load';
        setError(msg.includes('permission') ? 'You do not have permission to view this complaint.' : msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-navy-100" />
        <div className="h-64 animate-pulse rounded-xl bg-navy-100" />
        <TimelineSkeleton />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        {error || 'Complaint not found.'}
        <Link to="/citizen/complaints" className="mt-4 block text-grace-blue hover:underline">
          Back to My Complaints
        </Link>
      </div>
    );
  }

  const { grievance: g, aiAnalysis, slaPrediction, duplicates } = detail;

  return (
    <div className="space-y-6">
      <Link to="/citizen/complaints" className="inline-flex items-center gap-1 text-sm text-grace-blue hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to My Complaints
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-grace-blue">{g.grievanceId}</p>
          <h1 className="mt-1 text-2xl font-bold text-navy-900">{g.title}</h1>
        </div>
        <StatusBadge status={g.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card space-y-4 lg:col-span-2">
          <h2 className="font-semibold text-navy-900">Complaint Information</h2>
          <p className="text-sm leading-relaxed text-navy-700">{g.description}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Category" value={g.categoryId.name} />
            <Info label="Department" value={g.departmentId.name} />
            <Info label="Location" value={g.location} />
            <Info label="Ward" value={g.wardId.name} />
            <Info label="Priority" value={<PriorityBadge priority={g.priority} />} />
            <Info label="SLA Deadline" value={formatDate(g.slaDeadline)} />
            <Info
              label="Assigned Officer"
              value={
                g.assignedOfficerId?.userId?.name ??
                g.assignedOfficerId?.designation ??
                'Not yet assigned'
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          {slaPrediction && (
            <div className="card">
              <h3 className="font-semibold text-navy-900">SLA Prediction</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-navy-500">Risk Level</span>
                  <SlaRiskBadge risk={slaPrediction.riskLevel} />
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-500">Risk %</span>
                  <span className="font-medium">{slaPrediction.riskPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-500">Remaining</span>
                  <span className="font-medium">{slaPrediction.remainingHours}h</span>
                </div>
                <p className="mt-2 text-xs text-navy-600">{slaPrediction.recommendation}</p>
              </div>
            </div>
          )}

          {aiAnalysis && (
            <div className="card">
              <h3 className="font-semibold text-navy-900">AI Demo Analysis</h3>
              <p className="text-xs text-grace-cyan">AI Method: Rule-Based Demo</p>
              <div className="mt-3 space-y-2 text-sm">
                <Info label="Confidence" value={`${aiAnalysis.confidence}%`} />
                <Info label="Duplicate Prob." value={`${aiAnalysis.duplicateProbability}%`} />
                <p className="text-xs text-navy-600">{aiAnalysis.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {duplicates.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-navy-900">Duplicate Information</h3>
          <ul className="mt-3 space-y-2">
            {duplicates.map((d) => (
              <li key={d._id} className="rounded-lg bg-navy-50 p-3 text-sm">
                <span className="font-mono text-grace-blue">{d.matchedGrievanceId.grievanceId}</span>
                {' — '}{d.similarityScore}% match — {d.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h3 className="mb-4 font-semibold text-navy-900">Status Timeline</h3>
        <StatusTimeline items={timeline} currentStatus={g.status} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-navy-500">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-navy-900">{value}</div>
    </div>
  );
}

function StatusTimeline({
  items,
  currentStatus,
}: {
  items: StatusHistoryItem[];
  currentStatus: string;
}) {
  if (items.length === 0) return <TimelineSkeleton />;

  return (
    <div className="relative space-y-0 pl-6">
      <div className="absolute bottom-2 left-[11px] top-2 w-0.5 bg-navy-200" />
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const isCurrent = item.newStatus === currentStatus && isLast;
        return (
          <div key={item._id} className="relative pb-6">
            <div
              className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                isCurrent
                  ? 'border-grace-cyan bg-grace-cyan text-white'
                  : 'border-emerald-500 bg-emerald-500 text-white'
              }`}
            >
              {isCurrent ? '●' : '✓'}
            </div>
            <div>
              <p className="font-medium text-navy-900">{item.newStatus.replace(/_/g, ' ')}</p>
              <p className="text-xs text-navy-500">{formatDateTime(item.createdAt)}</p>
              {item.changedBy && (
                <p className="text-xs text-navy-400">by {item.changedBy.name}</p>
              )}
              {item.comment && <p className="mt-1 text-sm text-navy-600">{item.comment}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
