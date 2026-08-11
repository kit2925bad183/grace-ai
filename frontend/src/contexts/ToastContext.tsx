import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const value: ToastContextValue = {
    toast: add,
    success: (m) => add(m, 'success'),
    error: (m) => add(m, 'error'),
    warning: (m) => add(m, 'warning'),
    info: (m) => add(m, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex min-w-[280px] max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-elevated toast-enter',
              t.type === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
              t.type === 'error' && 'border-red-200 bg-red-50 text-red-800',
              t.type === 'warning' && 'border-amber-200 bg-amber-50 text-amber-900',
              t.type === 'info' && 'border-navy-200 bg-white text-navy-800'
            )}
          >
            {t.type === 'success' && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            {t.type === 'warning' && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
            {t.type === 'info' && <Info className="mt-0.5 h-4 w-4 shrink-0" />}
            <p className="flex-1 text-sm">{t.message}</p>
            <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
