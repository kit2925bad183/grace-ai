import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { listDuplicates, updateDuplicateStatus } from '@/services/authorityService';
import type { DuplicateRecord } from '@/services/authorityService';
import { ComplaintListSkeleton } from '@/components/skeletons/Skeletons';
import { StatusBadge, formatDate } from '@/components/grievance/GrievanceBadges';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useToast } from '@/contexts/ToastContext';

export default function DuplicatesPage() {
  const { success, error: toastError } = useToast();
  const [data, setData] = useState<{ items: DuplicateRecord[]; pagination: { page: number; totalPages: number; total: number } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', page: 1 });
  const [confirmAction, setConfirmAction] = useState<{ id: string; status: string; label: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    listDuplicates({ ...filters, limit: 20 })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filters]);

  const handleAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      await updateDuplicateStatus(confirmAction.id, confirmAction.status);
      success(`Duplicate ${confirmAction.label.toLowerCase()} successfully`);
      setConfirmAction(null);
      load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Unable to update duplicate');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      POTENTIAL: 'bg-navy-100 text-navy-700',
      CONFIRMED: 'bg-red-100 text-red-700',
      DISMISSED: 'bg-gray-100 text-gray-600',
      MERGED: 'bg-emerald-100 text-emerald-700',
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-navy-100'}`}>
        {status === 'CONFIRMED' ? 'Confirmed Duplicate' : status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Duplicate Management</h1>

      <div className="card max-w-xs">
        <select value={filters.status} onChange={(e) => setFilters({ status: e.target.value, page: 1 })} className="input-field">
          <option value="">All Statuses</option>
          {['POTENTIAL', 'CONFIRMED', 'DISMISSED', 'MERGED'].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      {loading && !data ? (
        <ComplaintListSkeleton />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-navy-100 bg-navy-50 text-xs uppercase text-navy-500">
                <tr>
                  <th className="px-4 py-3">Primary Complaint</th>
                  <th className="px-4 py-3">Matched Complaint</th>
                  <th className="px-4 py-3">Similarity</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items ?? []).map((d) => (
                  <tr key={d._id} className="border-b border-navy-50 hover:bg-navy-50/50">
                    <td className="px-4 py-3">
                      <Link to={`/authority/grievances/${d.grievanceId.grievanceId}`} className="font-mono text-xs text-grace-cyan hover:underline">
                        {d.grievanceId.grievanceId}
                      </Link>
                      <p className="max-w-[140px] truncate text-xs text-navy-500">{d.grievanceId.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/authority/grievances/${d.matchedGrievanceId.grievanceId}`} className="font-mono text-xs text-grace-cyan hover:underline">
                        {d.matchedGrievanceId.grievanceId}
                      </Link>
                      <p className="max-w-[140px] truncate text-xs text-navy-500">{d.matchedGrievanceId.title}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">{d.similarityScore}%</td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-xs">{d.reason}</td>
                    <td className="px-4 py-3">{statusBadge(d.status)}</td>
                    <td className="px-4 py-3 text-navy-500">{formatDate(d.createdAt)}</td>
                    <td className="px-4 py-3">
                      {d.status === 'POTENTIAL' ? (
                        <div className="flex flex-wrap gap-2">
                          <Link to={`/authority/grievances/${d.grievanceId.grievanceId}`} className="text-xs text-grace-cyan hover:underline">
                            Review
                          </Link>
                          <button
                            onClick={() => setConfirmAction({ id: d._id, status: 'CONFIRMED', label: 'Confirm' })}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmAction({ id: d._id, status: 'DISMISSED', label: 'Dismiss' })}
                            className="text-xs text-navy-500 hover:underline"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => setConfirmAction({ id: d._id, status: 'MERGED', label: 'Merge' })}
                            className="text-xs text-emerald-600 hover:underline"
                          >
                            Merge
                          </button>
                        </div>
                      ) : (
                        <StatusBadge status={d.grievanceId.status} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.items.length === 0 && (
            <div className="card py-12 text-center text-navy-500">No duplicate matches found.</div>
          )}

          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-navy-500">
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  disabled={filters.page <= 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="btn-secondary px-3 py-1 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={filters.page >= data.pagination.totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="btn-secondary px-3 py-1 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAction}
        title={`${confirmAction?.label} Duplicate`}
        message={
          confirmAction?.status === 'MERGED'
            ? 'Both grievance records will be preserved. The matched grievance will be linked to the primary complaint.'
            : `Are you sure you want to ${confirmAction?.label?.toLowerCase()} this duplicate match?`
        }
        confirmLabel={confirmAction?.label ?? 'Confirm'}
        loading={actionLoading}
        variant={confirmAction?.status === 'CONFIRMED' ? 'danger' : 'default'}
      />
    </div>
  );
}
