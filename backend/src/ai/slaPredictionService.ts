import { GrievanceStatus, Priority, SLARiskLevel } from '../models/enums';
import { getEstimatedResolutionDays } from '../utils/slaUtils';
import { addDays } from '../utils/dateUtils';

export interface SlaPredictionResult {
  slaDeadline: Date;
  predictedResolutionDate: Date;
  riskLevel: SLARiskLevel;
  riskPercentage: number;
  remainingHours: number;
  recommendation: string;
}

export function computeSlaPrediction(
  priority: Priority,
  createdAt: Date,
  slaDeadline: Date,
  status: GrievanceStatus = GrievanceStatus.SUBMITTED
): SlaPredictionResult {
  const now = new Date();
  const totalMs = slaDeadline.getTime() - createdAt.getTime();
  const elapsedMs = now.getTime() - createdAt.getTime();
  const remainingMs = slaDeadline.getTime() - now.getTime();
  const remainingHours = Math.max(0, Math.round(remainingMs / (1000 * 60 * 60)));

  let riskPercentage: number;
  if (status === GrievanceStatus.RESOLVED || status === GrievanceStatus.CLOSED) {
    riskPercentage = 0;
  } else if (remainingMs <= 0) {
    riskPercentage = 90;
  } else {
    const elapsedRatio = totalMs > 0 ? elapsedMs / totalMs : 0;
    riskPercentage = Math.min(99, Math.round(elapsedRatio * 100));
  }

  let riskLevel: SLARiskLevel;
  if (riskPercentage >= 80) riskLevel = SLARiskLevel.CRITICAL;
  else if (riskPercentage >= 60) riskLevel = SLARiskLevel.HIGH;
  else if (riskPercentage >= 35) riskLevel = SLARiskLevel.MEDIUM;
  else riskLevel = SLARiskLevel.LOW;

  const predictedResolutionDate = addDays(createdAt, getEstimatedResolutionDays(priority));

  const recommendations: Record<SLARiskLevel, string> = {
    [SLARiskLevel.LOW]: 'Monitor progress and maintain current allocation.',
    [SLARiskLevel.MEDIUM]: 'Review case progress and consider resource reallocation.',
    [SLARiskLevel.HIGH]: 'Escalate to senior officer and prioritize field inspection.',
    [SLARiskLevel.CRITICAL]: 'Immediate escalation required — SLA breach imminent or overdue.',
  };

  return {
    slaDeadline,
    predictedResolutionDate,
    riskLevel,
    riskPercentage,
    remainingHours,
    recommendation: recommendations[riskLevel],
  };
}
