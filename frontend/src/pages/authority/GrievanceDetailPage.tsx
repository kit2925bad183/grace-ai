import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  getGrievanceDetails,
  getTimeline,
  getOfficers,
  assignOfficer,
  updateStatus,
} from '@/services/authorityService';
import type { GrievanceDetailResponse, StatusHistoryItem } from '@/types/grievance';
import type { Officer } from '@/services/authorityService';
import { useToast } from '@/contexts/ToastContext';
import { usePortalPaths } from '@/utils/portalPaths';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import { TimelineSkeleton } from '@/components/skeletons/Skeletons';
import {
  StatusBadge,
  PriorityBadge,
  SlaRiskBadge,
  formatDate,
  formatDateTime,
} from '@/components/grievance/GrievanceBadges';

const STATUS_OPTIONS = ['ASSIGNED', 'UNDER_REVIEW', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED', 'REJECTED'];

export default function AuthorityGrievanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const paths = usePortalPaths();
  const { success, error: toastError } = useToast();
  const [detail, setDetail] = useState<GrievanceDetailResponse | null>(null);
  const [timeline, setTimeline] = useState<StatusHistoryItem[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ status: string; label: string } | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assignComment, setAssignComment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    const [d, t] = await Promise.all([getGrievanceDetails(id), getTimeline(id)]);
    setDetail(d);
    setTimeline(t);
    setError('');
    const deptId = d.grievance.departmentId._id;
    try {
      const offs = await getOfficers(deptId);
      setOfficers(offs);
    } catch {
      setOfficers([]);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    setDetail(null);
    setTimeline([]);
    loadData()
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, loadData]);

  const handleAssign = async () => {
    if (!id || !selectedOfficer) return;
    setActionLoading(true);
    try {
      await assignOfficer(id, selectedOfficer, assignComment || undefined);
      success('Officer assigned successfully');
      setAssignOpen(false);
      await loadData();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Unable to assign officer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string, comment?: string) => {
    if (!id) return;
    setActionLoading(true);
    try {
      await updateStatus(id, status, comment);
      success(`Status updated to ${status.replace(/_/g, ' ')}`);
      setStatusOpen(false);
      setConfirmAction(null);
      await loadData();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Unable to update grievance');
    } finally {
      setActionLoading(false);
    }
  };

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
        {error || 'Grievance not found'}
        <Link to={paths.complaints} className="mt-4 block text-grace-coffee hover:underline">Back</Link>
      </div>
    );
  }

  const { grievance: g, aiAnalysis, slaPrediction, duplicates } = detail;

  return (
    <div className="space-y-6">
      <Link to={paths.complaints} className="inline-flex items-center gap-1 text-sm text-grace-coffee hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Grievances
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-grace-cyan">{g.grievanceId}</p>
          <h1 className="text-2xl font-bold text-navy-900">{g.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setAssignOpen(true)} className="btn-primary inline-flex items-center gap-2 text-sm">
            <UserPlus className="h-4 w-4" /> Assign Officer
          </button>
          <button onClick={() => setStatusOpen(true)} className="btn-secondary inline-flex items-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4" /> Update Status
          </button>
          <button
            onClick={() => setConfirmAction({ status: 'ESCALATED', label: 'Escalate' })}
            className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100"
          >
            <AlertTriangle className="h-4 w-4" /> Escalate
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-navy-100 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <StatusBadge status={g.status} />
              <PriorityBadge priority={g.priority} />
            </div>
            <p className="text-sm leading-relaxed text-navy-700">{g.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              <Info label="Category" value={g.categoryId.name} />
              <Info label="Department" value={g.departmentId.name} />
              <Info label="Ward" value={g.wardId.name} />
              <Info label="Location" value={g.location} />
              <Info label="Created" value={formatDate(g.createdAt)} />
              <Info label="SLA Deadline" value={formatDate(g.slaDeadline)} />
              <Info label="Resolved" value={g.resolvedAt ? formatDate(g.resolvedAt) : '—'} />
              <Info label="Officer" value={g.assignedOfficerId?.userId?.name ?? 'Not assigned'} />
            </div>
          </div>

          {aiAnalysis && (
            <div className="rounded-xl border border-grace-cyan/20 bg-white p-6">
              <h3 className="font-semibold text-navy-900">GRACE AI Analysis</h3>
              {aiAnalysis.analysisMethod && (
                <p className="text-xs text-grace-cyan">{aiAnalysis.analysisMethod}</p>
              )}
              <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
                <Info label="Category" value={aiAnalysis.category} />
                <Info label="Department" value={aiAnalysis.department} />
                <Info label="Priority" value={aiAnalysis.priority} />
                <Info label="Duplicate Prob." value={`${aiAnalysis.duplicateProbability}%`} />
                <Info label="SLA Risk" value={aiAnalysis.slaRisk} />
                <Info label="Est. Resolution" value={`${aiAnalysis.estimatedResolutionDays} days`} />
                <Info label="Confidence" value={`${aiAnalysis.confidence}%`} />
              </div>
              {aiAnalysis.detectedKeywords?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {aiAnalysis.detectedKeywords.map((kw) => (
                    <span key={kw} className="rounded bg-navy-100 px-2 py-0.5 text-xs">{kw}</span>
                  ))}
                </div>
              )}
              <p className="mt-3 text-sm text-navy-600">{aiAnalysis.recommendation}</p>
            </div>
          )}

          <div className="rounded-xl border border-navy-100 bg-white p-6">
            <h3 className="mb-4 font-semibold text-navy-900">Status History</h3>
            <Timeline items={timeline} />
          </div>
        </div>

        <div className="space-y-4">
          {slaPrediction && (
            <div className={`rounded-xl border p-6 ${
              slaPrediction.riskLevel === 'CRITICAL' ? 'border-red-200 bg-red-50' :
              slaPrediction.riskLevel === 'HIGH' ? 'border-orange-200 bg-orange-50' :
              slaPrediction.riskLevel === 'MEDIUM' ? 'border-amber-200 bg-amber-50' :
              'border-emerald-200 bg-emerald-50'
            }`}>
              <h3 className="font-semibold text-navy-900">SLA Prediction</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>Risk Level</span><SlaRiskBadge risk={slaPrediction.riskLevel} /></div>
                <div className="flex justify-between"><span>Risk %</span><strong>{slaPrediction.riskPercentage}%</strong></div>
                <div className="flex justify-between"><span>Remaining</span><strong>{slaPrediction.remainingHours}h</strong></div>
                <div className="flex justify-between"><span>Predicted</span><strong>{formatDate(slaPrediction.predictedResolutionDate)}</strong></div>
                <p className="mt-2 text-xs">{slaPrediction.recommendation}</p>
              </div>
            </div>
          )}

          {duplicates.length > 0 && (
            <div className="rounded-xl border border-navy-100 bg-white p-6">
              <h3 className="font-semibold text-navy-900">Duplicate Matches</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {duplicates.map((d) => (
                  <li key={d._id} className="rounded bg-navy-50 p-2">
                    <span className="font-mono text-grace-cyan">{d.matchedGrievanceId.grievanceId}</span>
                    {' — '}{d.similarityScore}% — {d.status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Officer">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-navy-700">Select Officer</label>
            <select value={selectedOfficer} onChange={(e) => setSelectedOfficer(e.target.value)} className="input-field mt-1">
              <option value="">Choose officer...</option>
              {officers.map((o) => (
                <option key={o._id} value={o._id}>{o.userId.name} — {o.designation}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-navy-700">Comment (optional)</label>
            <textarea value={assignComment} onChange={(e) => setAssignComment(e.target.value)} rows={2} className="input-field mt-1 resize-none" />
          </div>
          <button onClick={handleAssign} disabled={!selectedOfficer || actionLoading} className="btn-primary w-full disabled:opacity-60">
            {actionLoading ? 'Assigning...' : 'Assign Officer'}
          </button>
        </div>
      </Dialog>

      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} title="Update Status">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-navy-700">New Status</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field mt-1">
              <option value="">Select status...</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-navy-700">Comment (optional)</label>
            <textarea value={statusComment} onChange={(e) => setStatusComment(e.target.value)} rows={2} className="input-field mt-1 resize-none" />
          </div>
          <button
            onClick={() => {
              if (['RESOLVED', 'CLOSED', 'REJECTED'].includes(newStatus)) {
                setStatusOpen(false);
                setConfirmAction({ status: newStatus, label: newStatus.replace(/_/g, ' ') });
              } else if (newStatus) {
                handleStatusUpdate(newStatus, statusComment || undefined);
              }
            }}
            disabled={!newStatus || actionLoading}
            className="btn-primary w-full disabled:opacity-60"
          >
            Update Status
          </button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && handleStatusUpdate(confirmAction.status, statusComment || undefined)}
        title={`Confirm ${confirmAction?.label}`}
        message={`Are you sure you want to mark this grievance as ${confirmAction?.label}?`}
        confirmLabel={confirmAction?.label ?? 'Confirm'}
        loading={actionLoading}
        variant={confirmAction?.status === 'REJECTED' ? 'danger' : 'default'}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-navy-500">{label}</p>
      <p className="font-medium text-navy-900">{value}</p>
    </div>
  );
}

function Timeline({ items }: { items: StatusHistoryItem[] }) {
  return (
    <div className="relative space-y-0 pl-6">
      <div className="absolute bottom-2 left-[11px] top-2 w-0.5 bg-navy-200" />
      {items.map((item) => (
        <div key={item._id} className="relative pb-4">
          <div className="absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full bg-grace-cyan text-xs text-white">✓</div>
          <p className="font-medium text-navy-900">{item.newStatus.replace(/_/g, ' ')}</p>
          <p className="text-xs text-navy-500">{formatDateTime(item.createdAt)} · {item.changedBy?.name}</p>
          {item.comment && <p className="mt-1 text-sm text-navy-600">{item.comment}</p>}
        </div>
      ))}
    </div>
  );
}
