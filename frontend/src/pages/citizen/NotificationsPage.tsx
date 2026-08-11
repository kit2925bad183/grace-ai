import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '@/services/notificationService';
import { useToast } from '@/contexts/ToastContext';
import type { NotificationItem } from '@/types/grievance';
import { NotificationSkeleton } from '@/components/skeletons/Skeletons';
import { formatDateTime } from '@/components/grievance/GrievanceBadges';

export default function CitizenNotificationsPage() {
  const { success, error: toastError } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getNotifications()
      .then(setNotifications)
      .catch((err) => toastError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      success('Notification marked as read');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  if (loading) return <NotificationSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="card py-12 text-center text-navy-500">No notifications yet.</div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`card flex items-start justify-between gap-4 ${!n.isRead ? 'border-l-4 border-l-grace-blue' : ''}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-navy-900">{n.title}</p>
                  {!n.isRead && (
                    <span className="rounded-full bg-grace-blue px-2 py-0.5 text-xs text-white">New</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-navy-600">{n.message}</p>
                <p className="mt-2 text-xs text-navy-400">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n._id)}
                  className="shrink-0 text-xs font-medium text-grace-blue hover:underline"
                >
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
