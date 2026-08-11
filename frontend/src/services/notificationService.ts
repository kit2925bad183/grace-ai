import api from './api';
import type { ApiResponse } from '@/types';
import type { NotificationItem } from '@/types/grievance';

export async function getNotifications(): Promise<NotificationItem[]> {
  const res = await api.get<ApiResponse<NotificationItem[]>>('/notifications');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load notifications');
  return res.data.data;
}

export async function getUnreadCount(): Promise<number> {
  const res = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load count');
  return res.data.data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  const res = await api.patch<ApiResponse<{ message: string }>>(`/notifications/${id}/read`);
  if (!res.data.success) throw new Error(res.data.message || 'Failed to mark as read');
}
