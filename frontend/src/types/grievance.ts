export type GrievanceStatus =
  | 'SUBMITTED'
  | 'AI_ANALYZED'
  | 'ASSIGNED'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SLARiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  defaultDepartmentId: { _id: string; name: string; code: string };
}

export interface Ward {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

export interface GrievanceSummary {
  _id: string;
  grievanceId: string;
  title: string;
  description: string;
  location: string;
  priority: Priority;
  status: GrievanceStatus;
  slaDeadline: string;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId: { _id: string; name: string };
  departmentId: { _id: string; name: string; code: string };
  wardId: { _id: string; name: string; code: string };
  assignedOfficerId?: {
    _id: string;
    designation: string;
    employeeCode: string;
    userId?: { name: string; email: string };
  };
  slaRisk?: SLARiskLevel | null;
  slaRiskPercentage?: number | null;
  feedbackRating?: number | null;
  feedbackComment?: string | null;
  feedbackAt?: string | null;
}

export interface AIAnalysisResult {
  category: string;
  department: string;
  priority: Priority;
  duplicateProbability: number;
  slaRisk: SLARiskLevel;
  estimatedResolutionDays: number;
  confidence: number;
  detectedKeywords: string[];
  recommendation: string;
  analysisMethod: string;
  potentialDuplicates?: Array<{
    matchedGrievancePublicId: string;
    matchedTitle: string;
    similarityScore: number;
    reason: string;
  }>;
  hasSignificantDuplicate?: boolean;
}

export interface SLAPrediction {
  _id?: string;
  slaDeadline: string;
  predictedResolutionDate: string;
  riskLevel: SLARiskLevel;
  riskPercentage: number;
  remainingHours: number;
  recommendation: string;
}

export interface StatusHistoryItem {
  _id: string;
  oldStatus?: GrievanceStatus;
  newStatus: GrievanceStatus;
  changedBy: { _id: string; name: string; role: string };
  comment?: string;
  createdAt: string;
}

export interface CitizenOverview {
  total: number;
  inProgress: number;
  resolved: number;
  slaAtRisk: number;
  recent: GrievanceSummary[];
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateGrievancePayload {
  title: string;
  description: string;
  categoryId: string;
  wardId: string;
  location: string;
  priority: Priority;
}

export interface GrievanceDetailResponse {
  grievance: GrievanceSummary;
  aiAnalysis: AIAnalysisResult | null;
  slaPrediction: SLAPrediction | null;
  duplicates: Array<{
    _id: string;
    similarityScore: number;
    reason: string;
    status: string;
    matchedGrievanceId: { grievanceId: string; title: string; status: string };
  }>;
}

export interface SubmitGrievanceResponse {
  grievance: GrievanceSummary;
  aiAnalysis: AIAnalysisResult | null;
  slaPrediction: SLAPrediction | null;
  duplicates: unknown[];
}
