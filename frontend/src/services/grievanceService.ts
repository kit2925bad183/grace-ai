import api from './api';
import type { ApiResponse } from '@/types';
import type {
  Category,
  Ward,
  CitizenOverview,
  GrievanceSummary,
  AIAnalysisResult,
  GrievanceDetailResponse,
  SubmitGrievanceResponse,
  CreateGrievancePayload,
  StatusHistoryItem,
  SLAPrediction,
} from '@/types/grievance';

export async function getCitizenOverview(): Promise<CitizenOverview> {
  const res = await api.get<ApiResponse<CitizenOverview>>('/analytics/citizen-overview');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load dashboard');
  return res.data.data;
}

export async function getCategories(): Promise<Category[]> {
  const res = await api.get<ApiResponse<Category[]>>('/categories');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load categories');
  return res.data.data;
}

export async function getWards(): Promise<Ward[]> {
  const res = await api.get<ApiResponse<Ward[]>>('/wards');
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load wards');
  return res.data.data;
}

export async function analyzeGrievance(payload: CreateGrievancePayload): Promise<AIAnalysisResult> {
  const res = await api.post<ApiResponse<AIAnalysisResult>>('/ai/analyze-grievance', payload);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Analysis failed');
  return res.data.data;
}

export async function submitGrievance(payload: CreateGrievancePayload): Promise<SubmitGrievanceResponse> {
  const res = await api.post<ApiResponse<SubmitGrievanceResponse>>('/grievances', payload);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Submission failed');
  return res.data.data;
}

export async function getMyGrievances(params?: {
  search?: string;
  status?: string;
  priority?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: GrievanceSummary[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const res = await api.get<ApiResponse<{ items: GrievanceSummary[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>>('/grievances/my', { params });
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load complaints');
  return res.data.data;
}

export async function getGrievanceDetails(id: string): Promise<GrievanceDetailResponse> {
  const res = await api.get<ApiResponse<GrievanceDetailResponse>>(`/grievances/${id}`);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Complaint not found');
  return res.data.data;
}

export async function getGrievanceTimeline(id: string): Promise<StatusHistoryItem[]> {
  const res = await api.get<ApiResponse<StatusHistoryItem[]>>(`/grievances/${id}/timeline`);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load timeline');
  return res.data.data;
}

export async function getGrievanceSla(id: string): Promise<SLAPrediction> {
  const res = await api.get<ApiResponse<SLAPrediction>>(`/grievances/${id}/sla`);
  if (!res.data.success || !res.data.data) throw new Error(res.data.message || 'Failed to load SLA');
  return res.data.data;
}
