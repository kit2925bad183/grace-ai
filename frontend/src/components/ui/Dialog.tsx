import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={cn('relative w-full max-w-md rounded-xl bg-white p-6 shadow-elevated', className)}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  variant?: 'danger' | 'default';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  loading,
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="mb-6 text-sm text-navy-600">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary" disabled={loading}>
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60',
            variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-grace-blue hover:bg-blue-700'
          )}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
