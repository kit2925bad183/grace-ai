import type { GrievanceStatus, Priority, SLARiskLevel } from '@/types/grievance';

/** Poster-style public journey labels mapped to backend statuses */
export const POSTER_JOURNEY: Array<{
  status: GrievanceStatus;
  label: string;
  description: string;
}> = [
  { status: 'SUBMITTED', label: 'Submitted', description: 'Your grievance has been received.' },
  { status: 'AI_ANALYZED', label: 'AI Classified', description: 'GRACE AI analyzed category, priority, and routing.' },
  { status: 'ASSIGNED', label: 'Routed & Assigned', description: 'Routed to the responsible department and assigned.' },
  { status: 'IN_PROGRESS', label: 'In Progress', description: 'The department is actively working on your grievance.' },
  { status: 'RESOLVED', label: 'Resolved', description: 'The reported issue has been addressed.' },
  { status: 'CLOSED', label: 'Closed', description: 'This grievance is complete.' },
];

export const FRIENDLY_STATUS: Record<GrievanceStatus, { label: string; description: string; icon: string }> = {
  SUBMITTED: { label: 'Received', description: 'Your complaint has been received.', icon: '✓' },
  AI_ANALYZED: { label: 'Reviewed by GRACE AI', description: 'GRACE AI has analyzed your complaint.', icon: '✓' },
  ASSIGNED: { label: 'Assigned', description: 'Your complaint has been sent to the responsible department.', icon: '✓' },
  UNDER_REVIEW: { label: 'Under Review', description: 'An officer is reviewing your complaint.', icon: '●' },
  IN_PROGRESS: { label: 'In Progress', description: 'The responsible department is currently working on your complaint.', icon: '●' },
  ESCALATED: { label: 'Escalated', description: 'Your complaint has been escalated for faster attention.', icon: '⚠' },
  RESOLVED: { label: 'Resolved', description: 'The reported issue has been resolved.', icon: '✓' },
  CLOSED: { label: 'Completed', description: 'This complaint has been completed.', icon: '✓' },
  REJECTED: { label: 'Not Processed', description: 'This complaint could not be processed. Please check the explanation below.', icon: '✕' },
};

export const JOURNEY_STEPS: GrievanceStatus[] = [
  'SUBMITTED',
  'AI_ANALYZED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
];

export function friendlyStatus(status: GrievanceStatus) {
  return FRIENDLY_STATUS[status] ?? { label: status.replace(/_/g, ' '), description: '', icon: '•' };
}

export function friendlySlaMessage(risk?: SLARiskLevel | null, remainingHours?: number, estimatedDays?: number): string {
  const days = estimatedDays ? `${estimatedDays} day${estimatedDays === 1 ? '' : 's'}` : remainingHours ? `${Math.ceil(remainingHours / 24)} days` : 'a few days';
  switch (risk) {
    case 'CRITICAL':
      return `Delayed — attention required. Expected within ${days}.`;
    case 'HIGH':
      return `May need attention soon. Your complaint should be resolved within ${days}.`;
    case 'MEDIUM':
      return `Still on track. Expected resolution within ${days}.`;
    case 'LOW':
    default:
      return `On track. Expected resolution within ${days}.`;
  }
}

export function friendlySlaShort(risk?: SLARiskLevel | null): { label: string; color: string } {
  switch (risk) {
    case 'CRITICAL':
      return { label: 'Delayed — attention required', color: 'text-civic-critical' };
    case 'HIGH':
      return { label: 'May need attention soon', color: 'text-civic-warning' };
    case 'MEDIUM':
      return { label: 'Still on track', color: 'text-civic-muted' };
    case 'LOW':
    default:
      return { label: 'On track', color: 'text-civic-success' };
  }
}

export function friendlyDepartment(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('road')) return '🛣️ Roads Department';
  if (lower.includes('water')) return '💧 Water Department';
  if (lower.includes('sanitation') || lower.includes('waste')) return '🗑️ Sanitation Department';
  if (lower.includes('electric')) return '⚡ Electricity Department';
  if (lower.includes('health')) return '🏥 Health Department';
  if (lower.includes('police') || lower.includes('safety')) return '🛡️ Public Safety';
  if (lower.includes('park')) return '🌳 Parks Department';
  const parts = name.split(/[—–-]/).map((p) => p.trim());
  const short = parts[parts.length - 1] || name;
  return short.length > 40 ? `${short.slice(0, 38)}…` : short;
}

export function friendlyPriority(priority: Priority): string {
  switch (priority) {
    case 'CRITICAL': return 'Urgent';
    case 'HIGH': return 'High priority';
    case 'MEDIUM': return 'Normal priority';
    case 'LOW': return 'Low priority';
    default: return priority;
  }
}

export function friendlyDuplicate(probability: number): string {
  if (probability >= 70) return 'Similar complaints found nearby';
  if (probability >= 40) return 'Possibly similar to another complaint';
  return 'Looks like a new issue';
}

export function greetingName(name?: string): string {
  const hour = new Date().getHours();
  const first = name?.split(' ')[0] ?? 'there';
  const time = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${time}, ${first}`;
}

export function statusIndex(status: GrievanceStatus): number {
  const map: Record<GrievanceStatus, number> = {
    SUBMITTED: 0,
    AI_ANALYZED: 1,
    ASSIGNED: 2,
    UNDER_REVIEW: 2,
    IN_PROGRESS: 3,
    ESCALATED: 3,
    RESOLVED: 4,
    CLOSED: 5,
    REJECTED: -1,
  };
  return map[status] ?? 0;
}

export function posterJourneyIndex(status: GrievanceStatus): number {
  return statusIndex(status);
}
