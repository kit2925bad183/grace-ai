export interface AnalyticsFilters {
  from?: string;
  to?: string;
  department?: string;
  category?: string;
  ward?: string;
  priority?: string;
  status?: string;
  period?: 'monthly' | 'daily';
}

export interface AnalyticsOverview {
  totalGrievances: number;
  submitted: number;
  inProgress: number;
  resolved: number;
  closed: number;
  escalated: number;
  rejected: number;
  slaAtRisk: number;
  slaCompliance: number;
  averageResolutionHours: number;
  averageResolutionDays: number;
  highPriority: number;
  criticalPriority: number;
  duplicateCount: number;
  resolvedTotal: number;
}

export interface TrendPoint {
  period: string;
  count: number;
}

export interface CategoryTrendPeriod {
  period: string;
  categories: Array<{ categoryName: string; categoryId: string; count: number }>;
}

export interface TrendsData {
  trends: TrendPoint[];
  categoryTrends: CategoryTrendPeriod[];
  period: string;
}

export interface DepartmentAnalytics {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  totalComplaints: number;
  resolved: number;
  inProgress: number;
  unresolved: number;
  highPriority: number;
  criticalPriority: number;
  averageResolutionTime: number;
  slaCompliance: number;
}

export interface DepartmentAnalyticsResponse {
  departments: DepartmentAnalytics[];
  rankings: {
    highestVolume: DepartmentAnalytics | null;
    bestSla: DepartmentAnalytics | null;
    longestResolution: DepartmentAnalytics | null;
    highestUnresolved: DepartmentAnalytics | null;
  };
}

export interface CategoryAnalyticsItem {
  categoryId: string;
  categoryName: string;
  complaintCount: number;
  percentage: number;
  resolved: number;
  unresolved: number;
  highPriority: number;
  criticalPriority: number;
}

export interface CategoryAnalyticsResponse {
  categories: CategoryAnalyticsItem[];
  priorityDistribution: Array<{ priority: string; count: number }>;
  totalCount: number;
}

export interface SLAAnalytics {
  total: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
  overdue: number;
  compliant: number;
  compliancePercentage: number;
}

export interface HotspotAnalytics {
  wardId: string;
  wardName: string;
  wardCode: string;
  complaintCount: number;
  topCategory: string;
  averageResolutionTime: number;
  slaCompliance: number;
  highPriorityCount: number;
  intensity: 'HIGH' | 'MEDIUM' | 'LOW';
  activityLabel: string;
}

export interface ForecastPoint {
  period: string;
  count?: number;
  predicted?: number;
}

export interface CategoryForecast {
  categoryId: string;
  categoryName: string;
  historical: ForecastPoint[];
  forecast: ForecastPoint[];
  method: string;
  insufficientData: boolean;
}

export interface ForecastData {
  historical: ForecastPoint[];
  forecast: ForecastPoint[];
  method: string;
  categoryForecasts: CategoryForecast[];
}

export interface RootCauseInsight {
  categoryId: string;
  categoryName: string;
  wardId: string;
  wardName: string;
  complaintCount: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  averageResolutionDays: number;
  slaCompliance: number;
  possibleRootCause: string;
  recommendation: string;
  insightLabel: string;
}

export interface AIRecommendationItem {
  _id: string;
  title: string;
  description?: string;
  evidence?: string;
  recommendation: string;
  priority: string;
  source: string;
  insightLabel: string;
  generatedAt: string;
  categoryId?: { _id: string; name: string };
  wardId?: { _id: string; name: string; code: string };
  departmentId?: { _id: string; name: string; code: string };
}

export interface PolicyImpactItem {
  _id: string;
  policyName: string;
  description: string;
  department: { _id: string; name: string; code: string };
  category?: { _id: string; name: string };
  beforeComplaintsPerMonth: number;
  afterComplaintsPerMonth: number;
  complaintChangePercent: number;
  slaBefore: number;
  slaAfter: number;
  slaImprovementPercent: number;
  impactPercentage: number;
  effectiveDate: string;
  isDemoSeed: boolean;
  label: string;
}

export type DateRangePreset = '7d' | '30d' | '90d' | 'year' | 'all' | 'custom';
