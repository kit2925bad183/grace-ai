import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  to: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  to,
  variant = 'secondary',
  className,
}: QuickActionCardProps) {
  return (
    <div
      className={cn(
        'card flex flex-col gap-4 border-grace-border',
        variant === 'primary' && 'border-grace-sandal/40 bg-white shadow-soft',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            variant === 'primary' ? 'bg-grace-coffee text-white' : 'bg-grace-sand text-grace-coffee'
          )}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-grace-text">{title}</h3>
          <p className="mt-1 text-sm text-grace-muted">{description}</p>
        </div>
      </div>
      <Link
        to={to}
        className={cn(
          'inline-flex min-h-[48px] w-full items-center justify-center rounded-xl px-4 text-base font-semibold transition-colors sm:w-auto',
          variant === 'primary' ? 'btn-primary' : 'btn-outline'
        )}
      >
        {actionLabel}
      </Link>
    </div>
  );
}

interface QuickActionsGridProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function QuickActionsGrid({ children, title = 'Quick Actions', className }: QuickActionsGridProps) {
  return (
    <section className={className} aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="text-lg font-semibold text-grace-text">
        {title}
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
