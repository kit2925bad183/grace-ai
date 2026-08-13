import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight, FilePlus, FileText, Search, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCitizenOverview, getMyGrievances } from '@/services/grievanceService';
import type { CitizenOverview, GrievanceSummary } from '@/types/grievance';
import { DashboardSkeleton } from '@/components/skeletons/Skeletons';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuickActionCard, QuickActionsGrid } from '@/components/ui/QuickActionCard';
import { HelpPanel } from '@/components/ui/HelpPanel';
import { CITIZEN_HELP } from '@/utils/helpContent';
import {
  CitizenStatusBadge,
  DepartmentLabel,
  PriorityBadge,
  SLAIndicator,
} from '@/components/grievance/GrievanceBadges';
import { friendlyStatus, greetingName } from '@/utils/civicLanguage';
import { usePortalPaths } from '@/utils/portalPaths';

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const paths = usePortalPaths();
  const [overview, setOverview] = useState<CitizenOverview | null>(null);
  const [complaints, setComplaints] = useState<GrievanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.allSettled([getCitizenOverview(), getMyGrievances({ page: 1, limit: 5 })])
      .then(([o, g]) => {
        if (o.status === 'fulfilled') setOverview(o.value);
        else setError(o.reason instanceof Error ? o.reason.message : 'Failed to load');
        if (g.status === 'fulfilled') setComplaints(g.value.items);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState title="Unable to load dashboard" message={error} onRetry={() => window.location.reload()} />;
  if (!overview) return null;

  const isFirstTime = overview.total === 0;
  const activeComplaint = complaints.find((c) =>
    !['RESOLVED', 'CLOSED', 'REJECTED'].includes(c.status)
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {isFirstTime ? (
        <section className="card border-grace-sandal/30 bg-white text-center sm:text-left">
          <h1 className="text-2xl font-bold text-grace-text sm:text-3xl">Welcome to GRACE AI</h1>
          <p className="mt-2 text-base text-grace-muted">
            Report a public issue and track its resolution from one place.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to={paths.complaintNew} className="btn-primary inline-flex gap-2">
              <FilePlus className="h-5 w-5" /> Report a Problem
            </Link>
            <Link to={paths.complaints} className="btn-outline">Track My Complaints</Link>
            <Link to={paths.notifications} className="btn-ghost">View Notifications</Link>
          </div>
        </section>
      ) : (
        <div>
          <h1 className="text-2xl font-bold text-grace-text sm:text-3xl">{greetingName(user?.name)}</h1>
          <p className="mt-1 text-base text-grace-muted">What would you like to do?</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <QuickActionCard
          icon={FilePlus}
          title="Report a Problem"
          description="Submit a new public issue in a few simple steps."
          actionLabel="Start Complaint"
          to={paths.complaintNew}
          variant="primary"
        />
        <QuickActionCard
          icon={Search}
          title="Track a Complaint"
          description="Check the progress of an existing complaint using your ID."
          actionLabel="Track Now"
          to={paths.track}
        />
      </div>

      {activeComplaint && (
        <section className="card border-grace-sandal/40 bg-grace-sand/30" aria-labelledby="active-heading">
          <h2 id="active-heading" className="text-sm font-semibold uppercase tracking-wider text-grace-sandal">
            Your active complaint
          </h2>
          <Link to={paths.complaint(activeComplaint.grievanceId)} className="mt-3 block">
            <p className="font-mono text-xs text-grace-coffee">{activeComplaint.grievanceId}</p>
            <p className="mt-1 text-lg font-semibold text-grace-text">{activeComplaint.title}</p>
            <div className="mt-2">
              <CitizenStatusBadge status={activeComplaint.status} />
            </div>
            <p className="mt-2 text-sm text-grace-muted">{friendlyStatus(activeComplaint.status).description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-grace-coffee">
              View details <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        </section>
      )}

      <QuickActionsGrid title="Quick Actions">
        <QuickLink icon={FilePlus} label="Report a Problem" to={paths.complaintNew} />
        <QuickLink icon={Search} label="Track Complaint" to={paths.track} />
        <QuickLink icon={Bell} label="View Notifications" to={paths.notifications} />
        <QuickLink icon={User} label="Update Profile" to={paths.profile} />
      </QuickActionsGrid>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="text-lg font-semibold text-grace-text">
          My Complaints
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={overview.total} />
          <StatCard label="Active" value={overview.inProgress} accent="text-civic-info" />
          <StatCard label="Resolved" value={overview.resolved} accent="text-civic-success" />
          <StatCard label="SLA At Risk" value={overview.slaAtRisk} accent="text-civic-warning" />
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <div className="flex items-center justify-between">
          <h2 id="recent-heading" className="text-lg font-semibold text-grace-text">
            Recent Complaints
          </h2>
          {complaints.length > 0 && (
            <Link to={paths.complaints} className="text-sm font-medium text-grace-coffee hover:underline">
              View all
            </Link>
          )}
        </div>

        {complaints.length === 0 ? (
          <EmptyState
            className="mt-4"
            title="No complaints yet"
            message="Have a public issue to report?"
            actionLabel="Report Your First Problem"
            actionTo={paths.complaintNew}
          />
        ) : (
          <ul className="mt-4 space-y-3">
            {complaints.map((g) => (
              <li key={g._id}>
                <Link to={paths.complaint(g.grievanceId)} className="card-interactive block p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-semibold text-grace-sandal">{g.grievanceId}</p>
                      <p className="mt-1 text-base font-semibold text-grace-text">{g.title}</p>
                      <DepartmentLabel name={g.departmentId.name} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CitizenStatusBadge status={g.status} />
                      <PriorityBadge priority={g.priority} />
                      {g.slaRisk && <SLAIndicator risk={g.slaRisk} />}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <HelpPanel items={CITIZEN_HELP} title="How can we help?" />
    </div>
  );
}

function StatCard({ label, value, accent = 'text-grace-text' }: { label: string; value: number; accent?: string }) {
  return (
    <div className="card py-4 text-center">
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      <p className="mt-1 text-xs font-medium text-grace-muted sm:text-sm">{label}</p>
    </div>
  );
}

function QuickLink({ icon: Icon, label, to }: { icon: typeof FileText; label: string; to: string }) {
  return (
    <Link to={to} className="card-interactive flex min-h-[56px] items-center gap-3 px-4 py-3">
      <Icon className="h-5 w-5 text-grace-coffee" aria-hidden="true" />
      <span className="text-sm font-medium text-grace-text">{label}</span>
    </Link>
  );
}
