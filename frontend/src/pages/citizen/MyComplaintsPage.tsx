import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getMyGrievances } from '@/services/grievanceService';
import type { GrievanceSummary } from '@/types/grievance';
import { ComplaintListSkeleton } from '@/components/skeletons/Skeletons';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { Pagination } from '@/components/ui/Pagination';
import { CitizenStatusBadge, DepartmentLabel, formatDate } from '@/components/grievance/GrievanceBadges';
import { friendlyStatus } from '@/utils/civicLanguage';
import { usePortalPaths } from '@/utils/portalPaths';

const STATUS_OPTIONS = [
  { value: 'SUBMITTED', label: 'Received' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'ESCALATED', label: 'Escalated' },
];

export default function MyComplaintsPage() {
  const paths = usePortalPaths();
  const [complaints, setComplaints] = useState<GrievanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const load = useCallback(() => {
    setLoading(true);
    getMyGrievances({
      search: search || undefined,
      status: status || undefined,
      page,
      limit: 20,
    })
      .then((res) => {
        setComplaints(res.items);
        setPagination(res.pagination);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const activeFilters = [status].filter(Boolean).length;

  if (loading && complaints.length === 0) return <ComplaintListSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="My Complaints"
        subtitle="View and track complaints you have submitted."
        breadcrumbs={[{ label: 'Dashboard', to: paths.dashboard }, { label: 'My Complaints' }]}
        actions={
          <Link to={paths.complaintNew} className="btn-primary text-sm">
            Report a Problem
          </Link>
        }
      />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-grace-muted" aria-hidden="true" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search complaints by ID, title or location"
          className="input-field pl-12"
          aria-label="Search complaints"
        />
      </div>

      <FilterPanel
        fields={[{
          id: 'status',
          label: 'Status',
          type: 'select',
          value: status,
          options: STATUS_OPTIONS,
        }]}
        onChange={(id, value) => { if (id === 'status') { setStatus(value); setPage(1); } }}
        onClear={() => { setStatus(''); setPage(1); }}
        activeCount={activeFilters}
      />

      {error && <div className="card border-red-200 bg-red-50 text-grace-critical">{error}</div>}

      {complaints.length === 0 && !loading ? (
        <EmptyState
          title="No complaints yet"
          message="Have a public issue to report?"
          actionLabel="Report Your First Problem"
          actionTo={paths.complaintNew}
        />
      ) : (
        <>
          <ul className="space-y-3">
            {complaints.map((g) => (
              <li key={g._id}>
                <Link to={paths.complaint(g.grievanceId)} className="card-interactive block p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-grace-coffee">{g.grievanceId}</p>
                      <p className="mt-1 text-base font-semibold text-grace-text">{g.title}</p>
                      <DepartmentLabel name={g.departmentId.name} />
                      <p className="mt-1 text-xs text-grace-muted">{formatDate(g.createdAt)}</p>
                      <p className="mt-1 text-sm text-grace-muted">{friendlyStatus(g.status).description}</p>
                    </div>
                    <CitizenStatusBadge status={g.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
