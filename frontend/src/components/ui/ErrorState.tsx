import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-red-200 bg-red-50 p-6 text-center',
        className
      )}
    >
      <AlertCircle className="mx-auto h-8 w-8 text-red-500" aria-hidden="true" />
      <h3 className="mt-3 text-base font-semibold text-red-800">{title}</h3>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-secondary mt-4 inline-flex items-center gap-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
