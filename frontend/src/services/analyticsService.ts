import api from './api';
import type { ApiResponse } from '@/types';
import type {
  AnalyticsFilters,
  AnalyticsOverview,
  TrendsData,
  DepartmentAnalyticsResponse,
  CategoryAnalyticsResponse,
  SLAAnalytics,
  HotspotAnalytics,
  ForecastData,
  RootCauseInsight,
  AIRecommendationItem,
  PolicyImpactItem,
} from '@/types/analytics';

function buildParams(filters: AnalyticsFilters = {}) {
  const params: Record<string, string> = {};
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  if (filters.department) params.department = filters.department;
  if (filters.category) params.category = filters.category;
  if (filters.ward) params.ward = filters.ward;
  if (filters.priority) params.priority = filters.priority;
  if (filters.status) params.status = filters.status;
  if (filters.period) params.period = filters.period;
  return params;
}

export interface PublicGovernanceStats {
  totalGrievances: number;
  resolved: number;
  inProgress: number;
  slaCompliance: number;
  slaAtRisk: number;
  averageResolutionTime: number;
  duplicateComplaints: number;
}

export async function getPublicGovernanceStats(): Promise<PublicGovernanceStats> {
  const res = await api.get<ApiResponse<PublicGovernanceStats>>('/analytics/public-stats');
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || 'Failed to load public statistics');
  }
  return res.data.data;
}

export async function getAnalyticsOverview(filters?: AnalyticsFilters): Promise<AnalyticsOverview> {
  const res = await api.get<ApiResponse<AnalyticsOverview>>('/analytics/overview', {
    params: buildParams(filters),
  });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load overview');
  return res.data.data;
}

export async function getAnalyticsTrends(filters?: AnalyticsFilters): Promise<TrendsData> {
  const res = await api.get<ApiResponse<TrendsData>>('/analytics/trends', { params: buildParams(filters) });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load trends');
  return res.data.data;
}

export async function getDepartmentAnalytics(filters?: AnalyticsFilters): Promise<DepartmentAnalyticsResponse> {
  const res = await api.get<ApiResponse<DepartmentAnalyticsResponse>>('/analytics/departments', {
    params: buildParams(filters),
  });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load departments');
  return res.data.data;
}

export async function getCategoryAnalytics(filters?: AnalyticsFilters): Promise<CategoryAnalyticsResponse> {
  const res = await api.get<ApiResponse<CategoryAnalyticsResponse>>('/analytics/categories', {
    params: buildParams(filters),
  });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load categories');
  return res.data.data;
}

export async function getSlaAnalytics(filters?: AnalyticsFilters): Promise<SLAAnalytics> {
  const res = await api.get<ApiResponse<SLAAnalytics>>('/analytics/sla', { params: buildParams(filters) });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load SLA analytics');
  return res.data.data;
}

export async function getHotspotAnalytics(filters?: AnalyticsFilters): Promise<HotspotAnalytics[]> {
  const res = await api.get<ApiResponse<HotspotAnalytics[]>>('/analytics/hotspots', {
    params: buildParams(filters),
  });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load hotspots');
  return res.data.data;
}

export async function getForecastAnalytics(filters?: AnalyticsFilters): Promise<ForecastData> {
  const res = await api.get<ApiResponse<ForecastData>>('/analytics/forecast', { params: buildParams(filters) });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load forecast');
  return res.data.data;
}

export async function getRootCauseAnalytics(filters?: AnalyticsFilters): Promise<RootCauseInsight[]> {
  const res = await api.get<ApiResponse<RootCauseInsight[]>>('/analytics/root-causes', {
    params: buildParams(filters),
  });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load root causes');
  return res.data.data;
}

export async function getPolicyImpactAnalytics(): Promise<PolicyImpactItem[]> {
  const res = await api.get<ApiResponse<PolicyImpactItem[]>>('/analytics/policy-impact');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load policy impact');
  return res.data.data;
}

export async function getAIRecommendations(filters?: AnalyticsFilters): Promise<AIRecommendationItem[]> {
  const res = await api.get<ApiResponse<AIRecommendationItem[]>>('/ai/recommendations', {
    params: buildParams(filters),
  });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load recommendations');
  return res.data.data;
}

export function getDateRangeFromPreset(preset: string): { from?: string; to?: string } {
  const now = new Date();
  const to = now.toISOString();

  switch (preset) {
    case '7d': {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      return { from: from.toISOString(), to };
    }
    case '30d': {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      return { from: from.toISOString(), to };
    }
    case '90d': {
      const from = new Date(now);
      from.setDate(from.getDate() - 90);
      return { from: from.toISOString(), to };
    }
    case 'year': {
      const from = new Date(now.getFullYear(), 0, 1);
      return { from: from.toISOString(), to };
    }
    default:
      return {};
  }
}

export function exportCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
