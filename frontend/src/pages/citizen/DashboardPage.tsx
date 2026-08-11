import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus, AlertTriangle, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCitizenOverview } from '@/services/grievanceService';
import { getNotifications } from '@/services/notificationService';
import type { CitizenOverview, NotificationItem } from '@/types/grievance';
import { DashboardSkeleton } from '@/components/skeletons/Skeletons';
import { StatusBadge, PriorityBadge, formatDate } from '@/components/grievance/GrievanceBadges';

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<CitizenOverview | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.allSettled([getCitizenOverview(), getNotifications()]).then(([overviewResult, notificationsResult]) => {
      if (overviewResult.status === 'fulfilled') {
        setOverview(overviewResult.value);
      } else {
        setError(
          overviewResult.reason instanceof Error
            ? overviewResult.reason.message
            : 'Failed to load dashboard'
        );
      }

      if (notificationsResult.status === 'fulfilled') {
        setNotifications(notificationsResult.value.filter((n) => !n.isRead).slice(0, 3));
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
    );
  }

  if (!overview) return null;

  const cards = [
    { label: 'Total Complaints', value: overview.total, color: 'text-grace-blue' },
    { label: 'Active Complaints', value: overview.inProgress, color: 'text-grace-cyan' },
    { label: 'Resolved', value: overview.resolved, color: 'text-grace-success' },
    { label: 'SLA At Risk', value: overview.slaAtRisk, color: 'text-grace-warning' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Welcome back, {user?.name ?? 'Citizen'}
          </h1>
          <p className="mt-1 text-sm text-navy-500">
            Track and manage your grievances with transparent updates
          </p>
        </div>
        <Link to="/citizen/register" className="btn-primary inline-flex items-center gap-2">
          <FilePlus className="h-4 w-4" />
          Register a New Grievance
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card">
            <p className="text-sm font-medium text-navy-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy-900">Recent Complaints</h2>
            <Link to="/citizen/complaints" className="text-sm font-medium text-grace-blue hover:underline">
              View All Complaints
            </Link>
          </div>
          {overview.recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-navy-500">No complaints yet. Register your first grievance.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-navy-100 text-xs uppercase text-navy-500">
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 pr-4">Title</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Priority</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recent.map((g) => (
                    <tr key={g._id} className="border-b border-navy-50 hover:bg-navy-50/50">
                      <td className="py-3 pr-4">
                        <Link to={`/citizen/complaints/${g.grievanceId}`} className="font-mono text-xs text-grace-blue hover:underline">
                          {g.grievanceId}
                        </Link>
                      </td>
                      <td className="max-w-[160px] truncate py-3 pr-4">{g.title}</td>
                      <td className="py-3 pr-4">{g.categoryId.name}</td>
                      <td className="py-3 pr-4"><StatusBadge status={g.status} /></td>
                      <td className="py-3 pr-4"><PriorityBadge priority={g.priority} /></td>
                      <td className="py-3 text-navy-500">{formatDate(g.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-grace-blue" />
            <h2 className="text-lg font-semibold text-navy-900">Notifications</h2>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-navy-500">No unread notifications</p>
          ) : (
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li key={n._id} className="rounded-lg bg-navy-50 p-3">
                  <p className="text-sm font-medium text-navy-900">{n.title}</p>
                  <p className="mt-1 text-xs text-navy-600">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
          <Link to="/citizen/notifications" className="mt-4 block text-sm font-medium text-grace-blue hover:underline">
            View all notifications
          </Link>
        </div>
      </div>

      {overview.slaAtRisk > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">{overview.slaAtRisk} complaint(s) at SLA risk</p>
            <p className="text-sm text-amber-700">Review your active complaints for approaching deadlines.</p>
          </div>
        </div>
      )}
    </div>
  );
}
