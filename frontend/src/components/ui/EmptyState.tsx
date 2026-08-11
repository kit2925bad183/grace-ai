import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  actionTo,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('rounded-xl border border-dashed border-navy-200 bg-navy-50/50 py-12 text-center', className)}>
      <Inbox className="mx-auto h-10 w-10 text-navy-300" aria-hidden="true" />
      <h3 className="mt-4 text-base font-semibold text-navy-800">{title}</h3>
      {message && <p className="mx-auto mt-1 max-w-md text-sm text-navy-500">{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-4 inline-flex text-sm">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button type="button" onClick={onAction} className="btn-primary mt-4 text-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
