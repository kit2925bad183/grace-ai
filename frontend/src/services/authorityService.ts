import api from './api';
import type { ApiResponse } from '@/types';
import type {
  GrievanceSummary,
  GrievanceDetailResponse,
  StatusHistoryItem,
  SLAPrediction,
  NotificationItem,
} from '@/types/grievance';

export interface AuthorityOverview {
  totalGrievances: number;
  resolved: number;
  inProgress: number;
  slaCompliance: number;
  slaAtRisk: number;
  duplicateComplaints: number;
  averageResolutionTime: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Officer {
  _id: string;
  employeeCode: string;
  designation: string;
  departmentId: { _id: string; name: string; code: string };
  userId: { _id: string; name: string; email: string };
  wardIds: Array<{ _id: string; name: string; code: string }>;
}

export interface DuplicateRecord {
  _id: string;
  similarityScore: number;
  reason: string;
  status: string;
  createdAt: string;
  grievanceId: GrievanceSummary;
  matchedGrievanceId: { _id: string; grievanceId: string; title: string; status: string };
}

export interface SlaMonitoringItem extends SLAPrediction {
  grievanceId: GrievanceSummary;
}

export async function getAuthorityOverview(): Promise<AuthorityOverview> {
  const res = await api.get<ApiResponse<AuthorityOverview>>('/analytics/authority-overview');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load overview');
  return res.data.data;
}

export async function listGrievances(params: Record<string, string | number | undefined>): Promise<PaginatedResponse<GrievanceSummary>> {
  const res = await api.get<ApiResponse<PaginatedResponse<GrievanceSummary>>>('/grievances', { params });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load grievances');
  return res.data.data;
}

export async function getGrievanceDetails(id: string): Promise<GrievanceDetailResponse> {
  const res = await api.get<ApiResponse<GrievanceDetailResponse>>(`/grievances/${id}`);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Grievance not found');
  return res.data.data;
}

export async function getTimeline(id: string): Promise<StatusHistoryItem[]> {
  const res = await api.get<ApiResponse<StatusHistoryItem[]>>(`/grievances/${id}/timeline`);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load timeline');
  return res.data.data;
}

export async function assignOfficer(id: string, officerId: string, comment?: string): Promise<GrievanceSummary> {
  const res = await api.patch<ApiResponse<GrievanceSummary>>(`/grievances/${id}/assign`, { officerId, comment });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Assignment failed');
  return res.data.data;
}

export async function updateStatus(id: string, status: string, comment?: string): Promise<GrievanceSummary> {
  const res = await api.patch<ApiResponse<GrievanceSummary>>(`/grievances/${id}/status`, { status, comment });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Status update failed');
  return res.data.data;
}

export async function getOfficers(departmentId?: string): Promise<Officer[]> {
  const url = departmentId ? `/officers/department/${departmentId}` : '/officers';
  const res = await api.get<ApiResponse<Officer[]>>(url);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load officers');
  return res.data.data;
}

export async function getSlaMonitoring(params: Record<string, string | number | undefined>): Promise<{
  items: SlaMonitoringItem[];
  grouped: Record<string, number>;
  pagination: PaginatedResponse<SlaMonitoringItem>['pagination'];
}> {
  const res = await api.get<ApiResponse<{
    items: SlaMonitoringItem[];
    grouped: Record<string, number>;
    pagination: PaginatedResponse<SlaMonitoringItem>['pagination'];
  }>>('/analytics/sla-monitoring', { params });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load SLA data');
  return res.data.data;
}

export async function listDuplicates(params: Record<string, string | number | undefined>): Promise<PaginatedResponse<DuplicateRecord>> {
  const res = await api.get<ApiResponse<PaginatedResponse<DuplicateRecord>>>('/duplicates', { params });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load duplicates');
  return res.data.data;
}

export async function updateDuplicateStatus(id: string, status: string): Promise<DuplicateRecord> {
  const res = await api.patch<ApiResponse<DuplicateRecord>>(`/duplicates/${id}`, { status });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Update failed');
  return res.data.data;
}

export { getNotifications, getUnreadCount, markNotificationRead } from './notificationService';

export type { NotificationItem };
