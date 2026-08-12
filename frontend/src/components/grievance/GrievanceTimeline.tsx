import type { GrievanceStatus, StatusHistoryItem } from '@/types/grievance';
import {
  FRIENDLY_STATUS,
  JOURNEY_STEPS,
  friendlyStatus,
  statusIndex,
} from '@/utils/civicLanguage';
import { cn } from '@/utils/cn';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface CitizenJourneyProps {
  currentStatus: GrievanceStatus;
  timeline: StatusHistoryItem[];
  className?: string;
}

export function CitizenJourneyTimeline({ currentStatus, timeline, className }: CitizenJourneyProps) {
  const currentIdx = statusIndex(currentStatus);
  const isRejected = currentStatus === 'REJECTED';

  const stepMessages = JOURNEY_STEPS.map((step) => {
    const historyItem = timeline.find((t) => t.newStatus === step);
    const friendly = friendlyStatus(step);
    return { step, friendly, historyItem };
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
    <ol className={cn('space-y-0', className)} aria-label="Complaint progress">
      {stepMessages.map(({ step, friendly, historyItem }, index) => {
        const stepIdx = statusIndex(step);
        const isComplete = currentIdx > stepIdx;
        const isCurrent = currentIdx === stepIdx || (step === 'IN_PROGRESS' && ['UNDER_REVIEW', 'ESCALATED', 'IN_PROGRESS'].includes(currentStatus) && stepIdx === 3);
        const isPending = currentIdx < stepIdx && !isCurrent;

        return (
          <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
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
                isPending && 'border-civic-border bg-white text-civic-muted'
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
              <p className="text-base font-semibold text-civic-text">
                <span aria-hidden="true">{friendly.icon} </span>
                {friendly.label}
              </p>
              <p className="mt-0.5 text-sm text-civic-muted">
                {historyItem?.comment || friendly.description}
              </p>
              {isCurrent && (
                <span className="mt-2 inline-block rounded-full bg-civic-primary/10 px-2.5 py-0.5 text-xs font-medium text-civic-primary">
                  Current step
                </span>
              )}
            </div>
          </li>
        );
      })}
      {currentStatus === 'CLOSED' && currentIdx >= 4 && (
        <li className="flex gap-4 pt-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-civic-border bg-white text-civic-muted">
            <Circle className="h-4 w-4" />
          </div>
          <div className="pt-1">
            <p className="font-semibold text-civic-text">⚪ Completed</p>
            <p className="text-sm text-civic-muted">This complaint is closed</p>
          </div>
        </li>
      )}
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
