import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getGrievanceDetails, getGrievanceTimeline, getGrievanceSla } from '@/services/grievanceService';
import type { GrievanceDetailResponse, StatusHistoryItem, SLAPrediction } from '@/types/grievance';
import { TimelineSkeleton } from '@/components/skeletons/Skeletons';
import { CitizenJourneyTimeline } from '@/components/grievance/GrievanceTimeline';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { CitizenStatusBadge, DepartmentLabel, SLAIndicator, formatDate } from '@/components/grievance/GrievanceBadges';

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
      .then(([d, t, s]) => { setDetail(d); setTimeline(t); setSla(s); })
      .catch((err) => setError(err instanceof Error ? err.message : 'Complaint not found.'))
      .finally(() => setLoading(false));
  }, [grievanceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-civic-bg p-6">
        <TimelineSkeleton />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-civic-bg p-6">
        <div className="card max-w-md text-center">
          <p className="text-civic-critical">{error || 'Complaint not found.'}</p>
          <Link to="/login" className="btn-primary mt-4 inline-flex">Sign in to track</Link>
        </div>
      </div>
    );
  }

  const g = detail.grievance;

  return (
    <div className="min-h-screen bg-civic-bg">
      <header className="border-b border-civic-border bg-white px-4 py-4">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <BrandLogo size="sm" showTagline={false} to="/" />
          <span className="font-mono text-sm font-bold text-civic-primary">{g.grievanceId}</span>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-6 p-4 animate-fade-in sm:p-6">
        <div className="card">
          <h1 className="text-xl font-bold text-civic-text">{g.title}</h1>
          <div className="mt-3">
            <CitizenStatusBadge status={g.status} />
          </div>
          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm text-civic-muted">Department</p>
              <DepartmentLabel name={g.departmentId.name} />
            </div>
            {sla && (
              <div>
                <p className="text-sm text-civic-muted">Expected resolution</p>
                <SLAIndicator risk={sla.riskLevel} remainingHours={sla.remainingHours} />
              </div>
            )}
            <p className="text-sm text-civic-muted">Deadline: {formatDate(g.slaDeadline)}</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-civic-text">Your progress</h2>
          <CitizenJourneyTimeline currentStatus={g.status} timeline={timeline} className="mt-6" />
        </div>
      </main>
    </div>
  );
}
