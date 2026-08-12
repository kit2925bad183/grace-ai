import { useState } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FilterField {
  id: string;
  label: string;
  type: 'select' | 'text';
  value: string;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface FilterPanelProps {
  fields: FilterField[];
  onChange: (id: string, value: string) => void;
  onClear: () => void;
  activeCount?: number;
  className?: string;
}

export function FilterPanel({ fields, onChange, onClear, activeCount = 0, className }: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('space-y-3', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-grace-border bg-white px-4 py-2 text-sm font-medium text-grace-text hover:bg-grace-sand"
        aria-expanded={open}
      >
        <Filter className="h-4 w-4" aria-hidden="true" />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-grace-coffee px-2 py-0.5 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && (
        <div className="card grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <div key={field.id}>
              <label htmlFor={`filter-${field.id}`} className="mb-1 block text-sm font-medium text-grace-text">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  id={`filter-${field.id}`}
                  value={field.value}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className="input-field"
                >
                  <option value="">All</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`filter-${field.id}`}
                  type="text"
                  value={field.value}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="input-field"
                />
              )}
            </div>
          ))}
          <div className="flex items-end sm:col-span-2 lg:col-span-3">
            <button
              type="button"
              onClick={onClear}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium text-grace-muted hover:bg-grace-sand hover:text-grace-text"
            >
              <X className="h-4 w-4" aria-hidden="true" /> Clear filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
