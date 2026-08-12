import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { AlertTriangle, BarChart3, CheckCircle2, Clock, FileText, Users } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

import { getAuthorityOverview, listGrievances, listMyWork } from '@/services/authorityService';

import type { GrievanceSummary } from '@/types/grievance';

import { DashboardSkeleton } from '@/components/skeletons/Skeletons';

import { ErrorState } from '@/components/ui/ErrorState';

import { EmptyState } from '@/components/ui/EmptyState';

import { QuickActionsGrid } from '@/components/ui/QuickActionCard';

import { HelpPanel } from '@/components/ui/HelpPanel';

import { PageHeader } from '@/components/ui/PageHeader';

import { StatusBadge, PriorityBadge, SlaRiskBadge, formatDate } from '@/components/grievance/GrievanceBadges';

import { DEPARTMENT_HELP, HEAD_HELP } from '@/utils/helpContent';

import { usePortalPaths } from '@/utils/portalPaths';



export default function AuthorityDashboardPage() {

  const { user } = useAuth();

  const paths = usePortalPaths();

  const isHead = user?.role === 'HEAD_OF_DEPARTMENTS' || user?.role === 'ADMIN';

  const [overview, setOverview] = useState<Awaited<ReturnType<typeof getAuthorityOverview>> | null>(null);

  const [queue, setQueue] = useState<GrievanceSummary[]>([]);

  const [myWork, setMyWork] = useState<GrievanceSummary[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');



  useEffect(() => {

    const loads: Promise<unknown>[] = [

      getAuthorityOverview(user?.role),

      listGrievances({ page: 1, limit: 10, sort: 'smart' }, user?.role),

    ];

    if (!isHead) loads.push(listMyWork({ page: 1, limit: 5 }));



    Promise.all(loads)

      .then(([o, q, mw]) => {

        setOverview(o as Awaited<ReturnType<typeof getAuthorityOverview>>);

        setQueue((q as { items: GrievanceSummary[] }).items);

        if (mw) setMyWork((mw as { items: GrievanceSummary[] }).items);

      })

      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))

      .finally(() => setLoading(false));

  }, [user?.role, isHead]);



  if (loading) return <DashboardSkeleton />;

  if (error) return <ErrorState title="Unable to load" message={error} onRetry={() => window.location.reload()} />;

  if (!overview) return null;



  const attention = overview.attentionRequired;

  const displayQueue = overview.attentionQueue?.length ? overview.attentionQueue : queue;



  return (

    <div className="space-y-8 animate-fade-in">

      <PageHeader

        title={isHead ? "Today's Governance Summary" : `Your Department — ${user?.departmentName ?? 'Operations'}`}

        subtitle={

          isHead

            ? 'What requires attention right now across all departments.'

            : 'Work that needs your attention, prioritized by urgency.'

        }

      />



      {isHead && (

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

          <SummaryTile label="Total" value={overview.totalGrievances} />

          <SummaryTile label="Resolved" value={overview.resolved} />

          <SummaryTile label="SLA compliance" value={`${overview.slaCompliance}%`} />

          <SummaryTile label="Critical" value={attention?.criticalSla ?? overview.slaAtRisk} accent="text-grace-critical" />

          <SummaryTile label="Unassigned" value={attention?.unassigned ?? 0} accent="text-grace-warning" />

          <SummaryTile label="Depts at risk" value={attention?.departmentsNeedingAttention ?? 0} />

        </div>

      )}



      {!isHead && (

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

          <SummaryTile label="Pending" value={overview.inProgress} />

          <SummaryTile label="Resolved" value={overview.resolved} />

          <SummaryTile label="SLA At Risk" value={overview.slaAtRisk} accent="text-grace-warning" />

          <SummaryTile label="Avg resolution" value={`${overview.averageResolutionTime}d`} />

        </div>

      )}



      <section aria-labelledby="attention-heading">

        <h2 id="attention-heading" className="text-lg font-semibold text-grace-text">What needs attention?</h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <AttentionCard emoji="🔴" label="Critical SLA" value={attention?.criticalSla ?? overview.slaAtRisk} to={paths.sla} />

          <AttentionCard emoji="⏰" label="SLA Breaches" value={attention?.slaBreaches ?? 0} to={paths.sla} />

          <AttentionCard emoji="🟡" label="Unassigned" value={attention?.unassigned ?? 0} to={paths.complaints} />

          <AttentionCard emoji="📋" label="Duplicate clusters" value={attention?.duplicateClusters ?? overview.duplicateComplaints} to={paths.duplicates} />

        </div>

      </section>



      {!isHead && myWork.length > 0 && (

        <section aria-labelledby="mywork-heading">

          <div className="mb-3 flex items-center justify-between">

            <h2 id="mywork-heading" className="text-lg font-semibold text-grace-text">My Work</h2>

            <Link to={paths.complaints} className="text-sm font-medium text-grace-coffee hover:underline">View all</Link>

          </div>

          <div className="space-y-2">

            {myWork.map((g) => (

              <WorkCard key={g._id} g={g} paths={paths} />

            ))}

          </div>

        </section>

      )}



      <QuickActionsGrid title="Quick Actions">

        {isHead ? (

          <>

            <QuickLink icon={FileText} label="View All Complaints" to={paths.complaints} />

            <QuickLink icon={Clock} label="SLA Command Center" to={paths.sla} />

            <QuickLink icon={BarChart3} label="Analytics" to={paths.analytics} />

            <QuickLink icon={Users} label="Department Performance" to={paths.analytics} />

          </>

        ) : (

          <>

            <QuickLink icon={FileText} label="View New Complaints" to={paths.complaints} />

            <QuickLink icon={AlertTriangle} label="SLA At Risk" to={paths.sla} />

            <QuickLink icon={Users} label="Assign Officer" to={paths.complaints} />

            <QuickLink icon={CheckCircle2} label="Update Complaint" to={paths.complaints} />

          </>

        )}

      </QuickActionsGrid>



      <section aria-labelledby="queue-heading">

        <div className="mb-4 flex items-center justify-between">

          <h2 id="queue-heading" className="text-lg font-semibold text-grace-text">

            {isHead ? 'Priority queue' : 'Work that needs your attention'}

          </h2>

          <Link to={paths.complaints} className="text-sm font-medium text-grace-coffee hover:underline">View all</Link>

        </div>

        {displayQueue.length === 0 ? (

          <EmptyState title="Great!" message="No complaints are currently at high SLA risk." />

        ) : (

          <div className="space-y-2">

            {displayQueue.slice(0, 10).map((g) => (

              <Link key={g._id} to={paths.complaint(g.grievanceId)} className="card-interactive flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">

                  <p className="font-mono text-xs text-grace-coffee">{g.grievanceId}</p>

                  <p className="truncate font-medium text-grace-text">{g.title}</p>

                  <p className="text-xs text-grace-muted">{g.departmentId?.name} · {formatDate(g.createdAt)}</p>

                </div>

                <div className="flex flex-wrap gap-2">

                  <StatusBadge status={g.status} />

                  <PriorityBadge priority={g.priority} />

                  {g.slaRisk && <SlaRiskBadge risk={g.slaRisk} />}

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>



      <HelpPanel items={isHead ? HEAD_HELP : DEPARTMENT_HELP} />

    </div>

  );

}



function SummaryTile({ label, value, accent = 'text-grace-text' }: { label: string; value: string | number; accent?: string }) {

  return (

    <div className="card py-4 text-center">

      <p className={`text-2xl font-bold ${accent}`}>{value}</p>

      <p className="mt-1 text-xs font-medium text-grace-muted">{label}</p>

    </div>

  );

}



function AttentionCard({ emoji, label, value, to }: { emoji: string; label: string; value: number; to: string }) {

  return (

    <Link to={to} className="card-interactive flex items-center gap-3 p-4">

      <span className="text-2xl" aria-hidden="true">{emoji}</span>

      <div>

        <p className="text-2xl font-bold text-grace-text">{value}</p>

        <p className="text-sm text-grace-muted">{label}</p>

      </div>

    </Link>

  );

}



function QuickLink({ icon: Icon, label, to }: { icon: typeof FileText; label: string; to: string }) {

  return (

    <Link to={to} className="card-interactive flex min-h-[56px] items-center gap-3 px-4 py-3">

      <Icon className="h-5 w-5 text-grace-coffee" />

      <span className="text-sm font-medium text-grace-text">{label}</span>

    </Link>

  );

}



function WorkCard({ g, paths }: { g: GrievanceSummary; paths: ReturnType<typeof usePortalPaths> }) {

  return (

    <Link to={paths.complaint(g.grievanceId)} className="card-interactive block p-4">

      <div className="flex flex-wrap items-start justify-between gap-2">

        <div>

          <p className="font-mono text-xs text-grace-coffee">{g.grievanceId}</p>

          <p className="font-medium text-grace-text">{g.title}</p>

          <p className="text-xs text-grace-muted">{g.wardId?.name ?? '—'} · {g.priority}</p>

        </div>

        <div className="flex flex-wrap gap-2">

          <StatusBadge status={g.status} />

          {g.slaRiskPercentage != null && (

            <span className="badge bg-grace-sand text-grace-text">SLA: {g.slaRiskPercentage}%</span>

          )}

        </div>

      </div>

      <span className="mt-2 inline-block text-sm font-medium text-grace-coffee">Open Complaint →</span>

    </Link>

  );

}

