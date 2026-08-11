import { cn } from '@/utils/cn';
import type { GrievanceStatus, Priority, SLARiskLevel } from '@/types/grievance';

const statusColors: Record<GrievanceStatus, string> = {
  SUBMITTED: 'bg-navy-100 text-navy-700',
  AI_ANALYZED: 'bg-purple-100 text-purple-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-grace-cyan/20 text-grace-cyan',
  ESCALATED: 'bg-orange-100 text-orange-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-navy-100 text-navy-600',
  REJECTED: 'bg-red-100 text-red-700',
};

const priorityColors: Record<Priority, string> = {
  LOW: 'bg-navy-100 text-navy-600',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const slaColors: Record<SLARiskLevel, string> = {
  LOW: 'text-emerald-600',
  MEDIUM: 'text-amber-600',
  HIGH: 'text-orange-600',
  CRITICAL: 'text-red-600',
};

export function StatusBadge({ status }: { status: GrievanceStatus }) {
  return (
    <span className={cn('badge', statusColors[status] ?? 'bg-navy-100 text-navy-700')}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn('badge', priorityColors[priority])}>{priority}</span>
  );
}

export function SlaRiskBadge({ risk }: { risk?: SLARiskLevel | null }) {
  if (!risk) return <span className="text-xs text-navy-400">—</span>;
  return <span className={cn('text-xs font-semibold', slaColors[risk])}>{risk}</span>;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
