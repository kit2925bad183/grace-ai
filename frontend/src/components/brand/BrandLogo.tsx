import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GRACE_SUBTITLE } from '@/constants/graceIdentity';
import { cn } from '@/utils/cn';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  to?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

const sizes = {
  sm: { icon: 'h-9 w-9', iconInner: 'h-4 w-4', title: 'text-base', tagline: 'text-xs' },
  md: { icon: 'h-11 w-11', iconInner: 'h-5 w-5', title: 'text-lg', tagline: 'text-sm' },
  lg: { icon: 'h-14 w-14', iconInner: 'h-7 w-7', title: 'text-2xl', tagline: 'text-base' },
};

export function BrandLogo({
  size = 'md',
  showTagline = true,
  to,
  className,
  variant = 'light',
}: BrandLogoProps) {
  const s = sizes[size];
  const isDark = variant === 'dark';

  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-xl',
          s.icon,
          isDark ? 'bg-white/10' : 'bg-grace-coffee'
        )}
      >
        <Shield className={cn(s.iconInner, 'text-white')} aria-hidden="true" />
      </div>
      <div>
        <p className={cn('font-bold tracking-tight', s.title, isDark ? 'text-white' : 'text-grace-text')}>
          GRACE AI
        </p>
        {showTagline && (
          <p className={cn(s.tagline, isDark ? 'text-grace-sand/90' : 'text-grace-muted')}>
            {GRACE_TAGLINE}
          </p>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex rounded-lg focus:outline-none focus:ring-2 focus:ring-grace-sandal/40">
        {content}
      </Link>
    );
  }

  return content;
}

export const GRACE_TAGLINE = GRACE_SUBTITLE;
