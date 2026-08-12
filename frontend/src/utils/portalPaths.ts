import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

export function portalBaseForRole(role: UserRole): string {
  switch (role) {
    case 'CITIZEN':
      return '/user';
    case 'DEPARTMENT':
      return '/department';
    case 'HEAD_OF_DEPARTMENTS':
      return '/head';
    case 'ADMIN':
      return '/admin';
    default:
      return '/user';
  }
}

export function usePortalBase(): string {
  const { user } = useAuth();
  return portalBaseForRole(user?.role ?? 'CITIZEN');
}

export function usePortalPaths() {
  const base = usePortalBase();
  return {
    base,
    dashboard: `${base}/dashboard`,
    complaints: `${base}/complaints`,
    complaintNew: `${base}/complaints/new`,
    complaint: (id: string) => `${base}/complaints/${id}`,
    track: `${base}/track`,
    notifications: `${base}/notifications`,
    profile: `${base}/profile`,
    help: `${base}/help`,
    sla: `${base}/sla`,
    duplicates: `${base}/duplicates`,
    analytics: `${base}/analytics`,
    insights: `${base}/insights`,
    hotspots: `${base}/hotspots`,
    policyImpact: `${base}/policy-impact`,
    departments: `${base}/departments`,
    departmentHeads: `${base}/department-heads`,
    departmentUsers: `${base}/department-users`,
    users: `${base}/users`,
    auditLogs: `${base}/audit-logs`,
    security: `${base}/security`,
    settings: `${base}/settings`,
    health: `${base}/health`,
  };
}
