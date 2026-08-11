import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-navy-500">
            {breadcrumbs.map((item, i) => (
              <span key={item.label} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
                {item.to ? (
                  <Link to={item.to} className="hover:text-grace-blue hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-navy-700">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-navy-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
