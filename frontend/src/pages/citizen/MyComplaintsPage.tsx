import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getMyGrievances, getCategories } from '@/services/grievanceService';
import type { GrievanceSummary, Category } from '@/types/grievance';
import { ComplaintListSkeleton } from '@/components/skeletons/Skeletons';
import { StatusBadge, PriorityBadge, SlaRiskBadge, formatDate } from '@/components/grievance/GrievanceBadges';

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState<GrievanceSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getMyGrievances({ search: search || undefined, status: status || undefined, priority: priority || undefined, categoryId: categoryId || undefined })
      .then(setComplaints)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [search, status, priority, categoryId]);

  if (loading && complaints.length === 0) return <ComplaintListSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">My Complaints</h1>

      <div className="card space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, title, location..."
              className="input-field pl-9"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
            <option value="">All Statuses</option>
            {['SUBMITTED', 'AI_ANALYZED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field">
            <option value="">All Priorities</option>
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input-field">
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      {complaints.length === 0 && !loading ? (
        <div className="card py-12 text-center text-navy-500">No complaints found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-100 bg-navy-50">
              <tr className="text-xs uppercase text-navy-500">
                <th className="px-4 py-3">Complaint ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">SLA Risk</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((g) => (
                <tr key={g._id} className="border-b border-navy-50 hover:bg-navy-50/50">
                  <td className="px-4 py-3">
                    <Link to={`/citizen/complaints/${g.grievanceId}`} className="font-mono text-xs text-grace-blue hover:underline">
                      {g.grievanceId}
                    </Link>
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3">{g.title}</td>
                  <td className="px-4 py-3">{g.categoryId.name}</td>
                  <td className="max-w-[140px] truncate px-4 py-3">{g.departmentId.name}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={g.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                  <td className="px-4 py-3"><SlaRiskBadge risk={g.slaRisk} /></td>
                  <td className="px-4 py-3 text-navy-500">{formatDate(g.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
