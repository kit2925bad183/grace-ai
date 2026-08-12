import api from './api';
import type { ApiResponse } from '@/types';

export interface PlatformStats {
  totalUsers: number;
  totalCitizens: number;
  totalDepartments: number;
  departmentHeads: number;
  departmentUsers: number;
  totalAdmins: number;
  totalComplaints: number;
  activeComplaints: number;
  resolvedComplaints: number;
  slaCompliance: number;
  slaAtRisk: number;
  slaBreached: number;
  criticalComplaints: number;
  duplicateClusters: number;
  suspendedUsers: number;
  averageResolutionTime: number;
  attentionRequired?: {
    criticalSla: number;
    slaBreaches: number;
    unassigned: number;
    escalated: number;
    duplicateClusters: number;
    departmentsNeedingAttention: number;
  };
}

export interface AdminDepartment {
  _id: string;
  name: string;
  code: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  officeAddress?: string;
  active: boolean;
  stats?: {
    total: number;
    pending: number;
    resolved: number;
    staff: number;
  };
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  emailVerified?: boolean;
  phone?: string;
  employeeCode?: string;
  designation?: string;
  departmentId?: { _id: string; name: string; code: string };
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AuditLogItem {
  _id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  userId?: { name: string; email: string; role: string };
  newValue?: Record<string, unknown>;
  createdAt: string;
}

export interface SecurityEventItem {
  _id: string;
  eventType: string;
  severity: string;
  ipAddress?: string;
  userAgent?: string;
  userId?: { name: string; email: string };
  createdAt: string;
}

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  registrationEnabled: boolean;
  googleLoginEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  aiAnalysisEnabled: boolean;
  duplicateDetectionEnabled: boolean;
  forecastingEnabled: boolean;
  complaintSubmissionEnabled: boolean;
}

export interface GlobalSearchResult {
  users: AdminUser[];
  grievances: Array<{ _id: string; grievanceId: string; title: string; status: string; priority: string }>;
  departments: Array<{ _id: string; name: string; code: string; active: boolean }>;
  pagination: { page: number; limit: number; total: number };
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const res = await api.get<ApiResponse<PlatformStats>>('/admin/stats');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load stats');
  return res.data.data;
}

export async function listAdminDepartments(): Promise<AdminDepartment[]> {
  const res = await api.get<ApiResponse<AdminDepartment[]>>('/admin/departments');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load departments');
  return res.data.data;
}

export async function createDepartment(payload: Record<string, unknown>): Promise<AdminDepartment> {
  const res = await api.post<ApiResponse<AdminDepartment>>('/admin/departments', payload);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to create department');
  return res.data.data;
}

export async function updateDepartment(id: string, payload: Record<string, unknown>): Promise<AdminDepartment> {
  const res = await api.patch<ApiResponse<AdminDepartment>>(`/admin/departments/${id}`, payload);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to update department');
  return res.data.data;
}

export async function listAdminHeads(): Promise<AdminUser[]> {
  const res = await api.get<ApiResponse<AdminUser[]>>('/admin/heads');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load heads');
  return res.data.data;
}

export async function createHead(payload: Record<string, unknown>): Promise<AdminUser> {
  const res = await api.post<ApiResponse<AdminUser>>('/admin/heads', payload);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to create head');
  return res.data.data;
}

export async function createAdmin(payload: Record<string, unknown>): Promise<AdminUser> {
  const res = await api.post<ApiResponse<AdminUser>>('/admin/admins', payload);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to create admin');
  return res.data.data;
}

export async function createDepartmentUser(payload: Record<string, unknown>): Promise<AdminUser> {
  const res = await api.post<ApiResponse<AdminUser>>('/admin/users', payload);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to create user');
  return res.data.data;
}

export async function listAdminUsers(params?: Record<string, string | number | boolean | undefined>) {
  const res = await api.get<ApiResponse<{ items: AdminUser[]; pagination: { page: number; total: number; totalPages: number } }>>('/admin/users', { params });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load users');
  return res.data.data;
}

export async function updateUserStatus(id: string, status: string): Promise<AdminUser> {
  const res = await api.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, { status });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to update status');
  return res.data.data;
}

export async function changeUserRole(id: string, role: string, departmentId?: string): Promise<AdminUser> {
  const res = await api.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/role`, { role, departmentId });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to change role');
  return res.data.data;
}

export async function forceLogoutUser(id: string): Promise<void> {
  const res = await api.post<ApiResponse<{ message: string }>>(`/admin/users/${id}/force-logout`);
  if (!res.data.success) throw new Error(res.data.message || 'Failed to force logout');
}

export async function softDeleteUser(id: string, reason?: string): Promise<void> {
  const res = await api.post<ApiResponse<unknown>>(`/admin/users/${id}/soft-delete`, { reason });
  if (!res.data.success) throw new Error(res.data.message || 'Failed to archive user');
}

export async function verifyUserEmail(id: string): Promise<void> {
  const res = await api.post<ApiResponse<unknown>>(`/admin/users/${id}/verify-email`);
  if (!res.data.success) throw new Error(res.data.message || 'Failed to verify email');
}

export async function unlockUserAccount(id: string): Promise<void> {
  const res = await api.post<ApiResponse<unknown>>(`/admin/users/${id}/unlock`);
  if (!res.data.success) throw new Error(res.data.message || 'Failed to unlock account');
}

export async function globalAdminSearch(q: string): Promise<GlobalSearchResult> {
  const res = await api.get<ApiResponse<GlobalSearchResult>>('/admin/search', { params: { q } });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Search failed');
  return res.data.data;
}

export async function listAuditLogs(params?: Record<string, string | number | undefined>) {
  const res = await api.get<ApiResponse<{ items: AuditLogItem[]; pagination: { page: number; total: number; totalPages: number } }>>('/admin/audit-logs', { params });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load audit logs');
  return res.data.data;
}

export async function getSecurityDashboard() {
  const res = await api.get<ApiResponse<{
    failedLogins: number;
    successfulLogins: number;
    lockedAccounts: number;
    suspicious: number;
  }>>('/admin/security/dashboard');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load security dashboard');
  return res.data.data;
}

export async function listSecurityEvents(params?: Record<string, string | number | undefined>) {
  const res = await api.get<ApiResponse<{ items: SecurityEventItem[]; pagination: { page: number; total: number; totalPages: number } }>>('/admin/security/events', { params });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load security events');
  return res.data.data;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const res = await api.get<ApiResponse<PlatformSettings>>('/admin/settings');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load settings');
  return res.data.data;
}

export async function updatePlatformSettings(payload: Partial<PlatformSettings>): Promise<PlatformSettings> {
  const res = await api.patch<ApiResponse<PlatformSettings>>('/admin/settings', payload);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to update settings');
  return res.data.data;
}

export async function getPlatformHealth() {
  const res = await api.get<ApiResponse<Record<string, { status: string; label: string; detail?: string }>>>('/admin/health');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load health');
  return res.data.data;
}

export async function getSystemActivity() {
  const res = await api.get<ApiResponse<{ recordCounts: Record<string, number> }>>('/admin/activity');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load activity');
  return res.data.data;
}
