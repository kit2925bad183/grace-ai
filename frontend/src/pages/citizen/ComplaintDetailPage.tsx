import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getGrievanceDetails, getGrievanceTimeline } from '@/services/grievanceService';
import type { GrievanceDetailResponse, StatusHistoryItem } from '@/types/grievance';
import { TimelineSkeleton } from '@/components/skeletons/Skeletons';
import { CitizenJourneyTimeline } from '@/components/grievance/GrievanceTimeline';
import {
  CitizenStatusBadge,
  DepartmentLabel,
  SLAIndicator,
  formatDate,
} from '@/components/grievance/GrievanceBadges';
import { friendlySlaMessage } from '@/utils/civicLanguage';
import { usePortalPaths } from '@/utils/portalPaths';
import { PageHeader } from '@/components/ui/PageHeader';

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const paths = usePortalPaths();
  const [detail, setDetail] = useState<GrievanceDetailResponse | null>(null);
  const [timeline, setTimeline] = useState<StatusHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getGrievanceDetails(id), getGrievanceTimeline(id)])
      .then(([d, t]) => { setDetail(d); setTimeline(t); })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <TimelineSkeleton />;
  if (error || !detail) {
    return (
      <div className="card border-red-200 bg-red-50 text-civic-critical">
        {error || 'Complaint not found.'}
        <Link to={paths.complaints} className="mt-3 block text-grace-coffee hover:underline">Back to complaints</Link>
      </div>
    );
  }

  const { grievance: g, slaPrediction, aiAnalysis } = detail;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Complaint Details"
        subtitle="Track progress and see what happens next."
        breadcrumbs={[
          { label: 'Dashboard', to: paths.dashboard },
          { label: 'My Complaints', to: paths.complaints },
          { label: g.grievanceId },
        ]}
      />

      <div className="card">
        <p className="text-sm text-civic-muted">Your complaint</p>
        <p className="font-mono text-lg font-bold text-civic-primary">{g.grievanceId}</p>
        <h1 className="mt-2 text-xl font-bold text-civic-text">{g.title}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <CitizenStatusBadge status={g.status} />
        </div>
      </div>

      <div className="card space-y-3">
        <div>
          <p className="text-sm text-civic-muted">Department</p>
          <DepartmentLabel name={g.departmentId.name} />
        </div>
        {slaPrediction && (
          <div>
            <p className="text-sm text-civic-muted">Expected resolution</p>
            <SLAIndicator
              risk={slaPrediction.riskLevel}
              remainingHours={slaPrediction.remainingHours}
              estimatedDays={aiAnalysis?.estimatedResolutionDays}
            />
            <p className="mt-1 text-sm text-civic-muted">
              {friendlySlaMessage(slaPrediction.riskLevel, slaPrediction.remainingHours, aiAnalysis?.estimatedResolutionDays)}
            </p>
          </div>
        )}
        <p className="text-sm text-civic-muted">Deadline: {formatDate(g.slaDeadline)}</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-civic-text">Your progress</h2>
        <CitizenJourneyTimeline currentStatus={g.status} timeline={timeline} className="mt-6" />
      </div>

      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="flex w-full items-center justify-between rounded-2xl border border-civic-border bg-white px-4 py-3 text-sm font-medium text-civic-primary"
      >
        View details
        {showDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {showDetails && (
        <div className="card space-y-3 text-sm">
          <p><span className="text-civic-muted">Description:</span> {g.description}</p>
          <p><span className="text-civic-muted">Location:</span> {g.location}</p>
          <p><span className="text-civic-muted">Ward:</span> {g.wardId.name}</p>
          <p><span className="text-civic-muted">Category:</span> {g.categoryId.name}</p>
          <p><span className="text-civic-muted">Department (full):</span> {g.departmentId.name}</p>
          {aiAnalysis && (
            <>
              <p><span className="text-civic-muted">AI confidence:</span> {aiAnalysis.confidence}%</p>
              <p><span className="text-civic-muted">SLA risk:</span> {aiAnalysis.slaRisk}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
