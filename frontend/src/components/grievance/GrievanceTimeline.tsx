import type { GrievanceStatus, StatusHistoryItem } from '@/types/grievance';
import {
  FRIENDLY_STATUS,
  POSTER_JOURNEY,
  posterJourneyIndex,
} from '@/utils/civicLanguage';
import { cn } from '@/utils/cn';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface CitizenJourneyProps {
  currentStatus: GrievanceStatus;
  timeline: StatusHistoryItem[];
  className?: string;
}

export function CitizenJourneyTimeline({ currentStatus, timeline, className }: CitizenJourneyProps) {
  const currentIdx = posterJourneyIndex(currentStatus);
  const isRejected = currentStatus === 'REJECTED';

  const stepMessages = POSTER_JOURNEY.map(({ status, label, description }) => {
    const historyItem = timeline.find((t) => t.newStatus === status);
    return { status, label, description, historyItem };
  });

  if (isRejected) {
    return (
      <div className={cn('rounded-2xl border border-red-200 bg-red-50 p-4', className)}>
        <p className="font-semibold text-civic-critical">Not approved</p>
        <p className="mt-1 text-sm text-civic-muted">This complaint could not be processed.</p>
      </div>
    );
  }

  return (
    <ol className={cn('space-y-0', className)} aria-label="Grievance progress">
      {stepMessages.map(({ status, label, description, historyItem }, index) => {
        const stepIdx = posterJourneyIndex(status);
        const isComplete = currentIdx > stepIdx;
        const isCurrent =
          currentIdx === stepIdx ||
          (status === 'IN_PROGRESS' &&
            ['UNDER_REVIEW', 'ESCALATED', 'IN_PROGRESS'].includes(currentStatus) &&
            stepIdx === 3);

        return (
          <li key={status} className="relative flex gap-4 pb-8 last:pb-0">
            {index < stepMessages.length - 1 && (
              <span
                className={cn(
                  'absolute left-[19px] top-10 h-[calc(100%-1.5rem)] w-0.5',
                  isComplete ? 'bg-civic-success' : 'bg-civic-border'
                )}
                aria-hidden="true"
              />
            )}
            <div
              className={cn(
                'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
                isComplete && 'border-civic-success bg-civic-success text-white',
                isCurrent && 'border-civic-primary bg-civic-mint text-civic-primary',
                !isComplete && !isCurrent && 'border-civic-border bg-white text-civic-muted'
              )}
              aria-hidden="true"
            >
              {isComplete ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : isCurrent ? (
                <Clock className="h-5 w-5" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-base font-semibold uppercase tracking-wide text-civic-text">{label}</p>
              <p className="mt-0.5 text-sm text-civic-muted">
                {historyItem?.comment || description}
              </p>
              {historyItem?.createdAt && (
                <p className="mt-1 text-xs text-civic-muted">
                  {new Date(historyItem.createdAt).toLocaleString()}
                </p>
              )}
              {isCurrent && (
                <span className="mt-2 inline-block rounded-full bg-civic-primary/10 px-2.5 py-0.5 text-xs font-medium text-civic-primary">
                  Current step
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Authority timeline — technical statuses */
export function GrievanceTimeline({ items, className }: { items: StatusHistoryItem[]; className?: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-civic-muted">No timeline events yet.</p>;
  }

  return (
    <ol className={cn('relative space-y-0', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const label = FRIENDLY_STATUS[item.newStatus]?.label ?? item.newStatus.replace(/_/g, ' ');
        return (
          <li key={item._id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-0.5 bg-civic-border" aria-hidden="true" />
            )}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                isLast ? 'border-civic-primary bg-civic-primary text-white' : 'border-civic-success bg-green-50 text-civic-success'
              )}
            >
              {isLast ? <Circle className="h-3 w-3 fill-current" /> : <CheckCircle2 className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-civic-text">{label}</p>
              <p className="text-xs text-civic-muted">{item.newStatus.replace(/_/g, ' ')}</p>
              {item.comment && <p className="mt-1 text-sm text-civic-muted">{item.comment}</p>}
              {item.changedBy && <p className="mt-1 text-xs text-civic-muted">by {item.changedBy.name}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
