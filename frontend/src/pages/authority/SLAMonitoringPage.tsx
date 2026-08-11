import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getSlaMonitoring, updateStatus } from '@/services/authorityService';
import { getCategories, getWards } from '@/services/grievanceService';
import type { SlaMonitoringItem } from '@/services/authorityService';
import type { Category, Ward } from '@/types/grievance';
import { ComplaintListSkeleton } from '@/components/skeletons/Skeletons';
import { StatusBadge, SlaRiskBadge, formatDate } from '@/components/grievance/GrievanceBadges';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useToast } from '@/contexts/ToastContext';

export default function SLAMonitoringPage() {
  const { success, error: toastError } = useToast();
  const [items, setItems] = useState<SlaMonitoringItem[]>([]);
  const [grouped, setGrouped] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [escalateId, setEscalateId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    riskLevel: '',
    department: '',
    ward: '',
    status: '',
    sort: 'risk',
    page: 1,
  });

  const load = () => {
    setLoading(true);
    getSlaMonitoring({ ...filters, limit: 20 })
      .then((res) => {
        setItems(res.items);
        setGrouped(res.grouped);
        setPagination(res.pagination);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([getCategories(), getWards()]).then(([c, w]) => {
      setCategories(c);
      setWards(w);
    });
  }, []);

  useEffect(() => {
    load();
  }, [filters]);

  const departments = [...new Map(categories.map((c) => [c.defaultDepartmentId._id, c.defaultDepartmentId])).values()];

  const handleEscalate = async () => {
    if (!escalateId) return;
    setActionLoading(true);
    try {
      await updateStatus(escalateId, 'ESCALATED', 'Escalated due to SLA risk');
      success('Grievance escalated');
      setEscalateId(null);
      load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Unable to escalate');
    } finally {
      setActionLoading(false);
    }
  };

  const riskCards = [
    { level: 'CRITICAL', color: 'border-red-200 bg-red-50 text-red-700' },
    { level: 'HIGH', color: 'border-orange-200 bg-orange-50 text-orange-700' },
    { level: 'MEDIUM', color: 'border-amber-200 bg-amber-50 text-amber-700' },
    { level: 'LOW', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">SLA Monitoring</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {riskCards.map(({ level, color }) => (
          <button
            key={level}
            onClick={() => setFilters({ ...filters, riskLevel: filters.riskLevel === level ? '' : level, page: 1 })}
            className={`rounded-xl border p-4 text-left transition-shadow hover:shadow-card ${color} ${
              filters.riskLevel === level ? 'ring-2 ring-grace-cyan' : ''
            }`}
          >
            <p className="text-xs font-medium uppercase opacity-80">{level}</p>
            <p className="mt-1 text-2xl font-bold">{grouped[level] ?? 0}</p>
          </button>
        ))}
      </div>

      <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            placeholder="Search ID, title, location..."
            className="input-field pl-9"
          />
        </div>
        <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })} className="input-field">
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
        <select value={filters.ward} onChange={(e) => setFilters({ ...filters, ward: e.target.value, page: 1 })} className="input-field">
          <option value="">All Wards</option>
          {wards.map((w) => (
            <option key={w._id} value={w._id}>{w.name}</option>
          ))}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} className="input-field">
          <option value="">All Statuses</option>
          {['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED'].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })} className="input-field">
          <option value="risk">Highest risk first</option>
          <option value="deadline">Nearest deadline first</option>
          <option value="oldest">Oldest complaint first</option>
        </select>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      {loading && items.length === 0 ? (
        <ComplaintListSkeleton />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b border-navy-100 bg-navy-50 text-xs uppercase text-navy-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Ward</th>
                  <th className="px-4 py-3">Risk %</th>
                  <th className="px-4 py-3">Remaining</th>
                  <th className="px-4 py-3">Predicted</th>
                  <th className="px-4 py-3">SLA Deadline</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const g = item.grievanceId;
                  return (
                    <tr key={g.grievanceId} className="border-b border-navy-50 hover:bg-navy-50/50">
                      <td className="px-4 py-3 font-mono text-xs">{g.grievanceId}</td>
                      <td className="max-w-[140px] truncate px-4 py-3">{g.title}</td>
                      <td className="px-4 py-3">{g.departmentId.name}</td>
                      <td className="px-4 py-3">{g.wardId.name}</td>
                      <td className="px-4 py-3">
                        <SlaRiskBadge risk={item.riskLevel} /> {item.riskPercentage}%
                      </td>
                      <td className="px-4 py-3">{item.remainingHours}h</td>
                      <td className="px-4 py-3">{formatDate(item.predictedResolutionDate)}</td>
                      <td className="px-4 py-3">{formatDate(g.slaDeadline)}</td>
                      <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link to={`/authority/grievances/${g.grievanceId}`} className="text-grace-cyan hover:underline">
                            View
                          </Link>
                          {(item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL') && (
                            <button
                              onClick={() => setEscalateId(g.grievanceId)}
                              className="inline-flex items-center gap-1 text-orange-600 hover:underline"
                            >
                              <AlertTriangle className="h-3 w-3" /> Escalate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {items.length === 0 && (
            <div className="card py-12 text-center text-navy-500">No SLA records match your filters.</div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-navy-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
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
                  disabled={filters.page >= pagination.totalPages}
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
        open={!!escalateId}
        onClose={() => setEscalateId(null)}
        onConfirm={handleEscalate}
        title="Escalate Grievance"
        message="This grievance will be escalated for priority review due to SLA risk. The citizen will be notified."
        confirmLabel="Escalate"
        loading={actionLoading}
      />
    </div>
  );
}
