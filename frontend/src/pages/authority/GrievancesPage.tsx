import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { listGrievances } from '@/services/authorityService';
import { getCategories, getWards } from '@/services/grievanceService';
import type { GrievanceSummary } from '@/types/grievance';
import type { Category, Ward } from '@/types/grievance';
import { ComplaintListSkeleton } from '@/components/skeletons/Skeletons';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge, PriorityBadge, SlaRiskBadge, formatDate } from '@/components/grievance/GrievanceBadges';
import { useAuth } from '@/contexts/AuthContext';
import { usePortalPaths } from '@/utils/portalPaths';

export default function AuthorityGrievancesPage() {
  const { user } = useAuth();
  const paths = usePortalPaths();
  const [data, setData] = useState<{ items: GrievanceSummary[]; pagination: { page: number; totalPages: number; total: number } } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    department: '',
    category: '',
    ward: '',
    slaRisk: '',
    page: 1,
  });

  useEffect(() => {
    Promise.all([getCategories(), getWards()]).then(([c, w]) => {
      setCategories(c);
      setWards(w);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    listGrievances({ ...filters, limit: 20 }, user?.role)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [filters, user?.role]);

  const departments = [...new Map(categories.map((c) => [c.defaultDepartmentId._id, c.defaultDepartmentId])).values()];

  return (
    <div className="space-y-6">
      <PageHeader title="Grievance Management" subtitle="Search, filter, assign officers, and update statuses" />

      {error && <ErrorState message={error} onRetry={() => setFilters({ ...filters })} />}

      <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            placeholder="Search ID, title, location..."
            className="input-field pl-9"
            aria-label="Search grievances"
          />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} className="input-field" aria-label="Filter by status">
          <option value="">All Statuses</option>
          {['SUBMITTED', 'AI_ANALYZED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })} className="input-field" aria-label="Filter by priority">
          <option value="">All Priorities</option>
          {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })} className="input-field" aria-label="Filter by department">
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })} className="input-field" aria-label="Filter by category">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select value={filters.ward} onChange={(e) => setFilters({ ...filters, ward: e.target.value, page: 1 })} className="input-field" aria-label="Filter by ward">
          <option value="">All Wards</option>
          {wards.map((w) => (
            <option key={w._id} value={w._id}>{w.name}</option>
          ))}
        </select>
        <select value={filters.slaRisk} onChange={(e) => setFilters({ ...filters, slaRisk: e.target.value, page: 1 })} className="input-field" aria-label="Filter by SLA risk">
          <option value="">All SLA Risk</option>
          {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {loading && !data ? (
        <ComplaintListSkeleton />
      ) : (
        <>
          {(data?.items ?? []).length === 0 ? (
            <EmptyState title="No grievances found" message="Try adjusting your filters or search criteria." actionLabel="Clear filters" onAction={() => setFilters({ search: '', status: '', priority: '', department: '', category: '', ward: '', slaRisk: '', page: 1 })} />
          ) : (
          <>
          <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white table-sticky-header">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-navy-100 bg-navy-50 text-xs uppercase text-navy-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Dept</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">SLA</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Officer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items ?? []).map((g) => (
                  <tr key={g._id} className="border-b border-navy-50 hover:bg-navy-50/50">
                    <td className="px-4 py-3 font-mono text-xs">{g.grievanceId}</td>
                    <td className="max-w-[140px] truncate px-4 py-3">{g.title}</td>
                    <td className="px-4 py-3">{g.categoryId.name}</td>
                    <td className="max-w-[120px] truncate px-4 py-3">{g.location}</td>
                    <td className="max-w-[100px] truncate px-4 py-3">{g.departmentId.name}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={g.priority} /></td>
                    <td className="px-4 py-3"><SlaRiskBadge risk={g.slaRisk} /></td>
                    <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                    <td className="max-w-[100px] truncate px-4 py-3 text-xs">
                      {g.assignedOfficerId?.userId?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-navy-500">{formatDate(g.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link to={paths.complaint(g.grievanceId)} className="text-grace-coffee hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-navy-500">
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="btn-secondary px-3 py-1 disabled:opacity-50"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={filters.page >= data.pagination.totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="btn-secondary px-3 py-1 disabled:opacity-50"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          </>
          )}
        </>
      )}
    </div>
  );
}
