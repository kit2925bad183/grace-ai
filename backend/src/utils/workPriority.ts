import { GrievanceStatus, Priority } from '../models/enums';

const RESOLVED = new Set([GrievanceStatus.RESOLVED, GrievanceStatus.CLOSED, GrievanceStatus.REJECTED]);

const PRIORITY_SCORE: Record<Priority, number> = {
  CRITICAL: 40,
  HIGH: 30,
  MEDIUM: 20,
  LOW: 10,
};

export interface WorkPriorityInput {
  status: GrievanceStatus;
  priority: Priority;
  slaDeadline?: Date | string | null;
  slaRisk?: string | null;
  slaRiskPercentage?: number | null;
  assignedOfficerId?: unknown | null;
  createdAt?: Date | string;
}

/** Higher score = needs attention sooner. Used for department/head work queues. */
export function computeWorkPriorityScore(g: WorkPriorityInput, now = Date.now()): number {
  if (RESOLVED.has(g.status)) return 0;

  let score = PRIORITY_SCORE[g.priority] ?? 0;

  const riskPct = g.slaRiskPercentage ?? 0;
  if (g.slaRisk === 'CRITICAL' || riskPct >= 90) score += 100;
  else if (riskPct >= 75 || g.slaRisk === 'HIGH') score += 70;
  else if (riskPct >= 60 || g.slaRisk === 'MEDIUM') score += 45;

  if (g.slaDeadline) {
    const deadline = new Date(g.slaDeadline).getTime();
    if (deadline < now) score += 90;
    else if (deadline - now < 24 * 60 * 60 * 1000) score += 55;
  }

  if (!g.assignedOfficerId) score += 35;

  if (g.status === GrievanceStatus.ESCALATED) score += 50;
  if (g.status === GrievanceStatus.SUBMITTED || g.status === GrievanceStatus.AI_ANALYZED) score += 25;

  return score;
}

export function sortByWorkPriority<T extends WorkPriorityInput>(items: T[]): T[] {
  const now = Date.now();
  return [...items].sort((a, b) => {
    const diff = computeWorkPriorityScore(b, now) - computeWorkPriorityScore(a, now);
    if (diff !== 0) return diff;
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}
