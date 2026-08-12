import { cn } from '@/utils/cn';
import {
  friendlyStatus,
  friendlySlaShort,
  friendlyDepartment,
  friendlyPriority,
} from '@/utils/civicLanguage';
import type { GrievanceStatus, Priority, SLARiskLevel } from '@/types/grievance';

const statusColors: Record<GrievanceStatus, string> = {
  SUBMITTED: 'bg-civic-mint text-civic-primary',
  AI_ANALYZED: 'bg-civic-mint text-civic-primary',
  ASSIGNED: 'bg-blue-50 text-blue-800',
  UNDER_REVIEW: 'bg-amber-50 text-amber-800',
  IN_PROGRESS: 'bg-amber-50 text-amber-900',
  ESCALATED: 'bg-orange-50 text-orange-800',
  RESOLVED: 'bg-green-50 text-civic-success',
  CLOSED: 'bg-slate-100 text-civic-muted',
  REJECTED: 'bg-red-50 text-civic-critical',
};

const priorityColors: Record<Priority, string> = {
  LOW: 'bg-slate-100 text-civic-muted',
  MEDIUM: 'bg-civic-mint text-civic-primary',
  HIGH: 'bg-amber-50 text-amber-800',
  CRITICAL: 'bg-red-50 text-civic-critical',
};

/** Citizen-facing status badge — plain language */
export function CitizenStatusBadge({ status }: { status: GrievanceStatus }) {
  const f = friendlyStatus(status);
  return (
    <span className={cn('badge', statusColors[status] ?? 'bg-slate-100 text-civic-text')}>
      <span aria-hidden="true">{f.icon}</span>
      {f.label}
    </span>
  );
}

/** Authority-facing — technical status */
export function StatusBadge({ status }: { status: GrievanceStatus }) {
  return (
    <span className={cn('badge', statusColors[status] ?? 'bg-slate-100 text-civic-text')}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function PriorityBadge({ priority, friendly = false }: { priority: Priority; friendly?: boolean }) {
  return (
    <span className={cn('badge', priorityColors[priority])}>
      {friendly ? friendlyPriority(priority) : priority}
    </span>
  );
}

/** Citizen-friendly SLA indicator */
export function SLAIndicator({
  risk,
  remainingHours,
  estimatedDays,
  showTechnical = false,
}: {
  risk?: SLARiskLevel | null;
  remainingHours?: number;
  estimatedDays?: number;
  showTechnical?: boolean;
}) {
  if (!risk) return <span className="text-sm text-civic-muted">—</span>;
  const { label, color } = friendlySlaShort(risk);
  if (showTechnical) {
    return (
      <span className={cn('text-sm font-semibold', color)}>
        {risk} {remainingHours != null && `· ${remainingHours}h left`}
      </span>
    );
  }
  return (
    <p className={cn('text-sm font-medium', color)}>
      {label}
      {estimatedDays != null && (
        <span className="mt-0.5 block text-xs font-normal text-civic-muted">
          Expected within {estimatedDays} day{estimatedDays === 1 ? '' : 's'}
        </span>
      )}
    </p>
  );
}

export function SlaRiskBadge({ risk }: { risk?: SLARiskLevel | null }) {
  return <SLAIndicator risk={risk} showTechnical />;
}

export function DepartmentLabel({
  name,
  friendly = true,
}: {
  name: string;
  friendly?: boolean;
}) {
  return (
    <span className="text-sm font-medium text-civic-text">
      {friendly ? friendlyDepartment(name) : name}
    </span>
  );
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
