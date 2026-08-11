import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  subtext?: string;
  className?: string;
}

export function MetricCard({ label, value, icon: Icon, color, subtext, className }: MetricCardProps) {
  return (
    <div className={cn('rounded-xl border border-navy-100 bg-white p-5 shadow-card', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-navy-500">{label}</p>
        {Icon && <Icon className={cn('h-5 w-5', color ?? 'text-grace-blue')} aria-hidden="true" />}
      </div>
      <p className={cn('mt-3 text-3xl font-bold', color ?? 'text-navy-900')}>{value}</p>
      {subtext && <p className="mt-1 text-xs text-navy-500">{subtext}</p>}
    </div>
  );
}
