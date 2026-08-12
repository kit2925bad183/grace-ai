import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HelpItem {
  question: string;
  answer: string;
}

interface HelpPanelProps {
  items: HelpItem[];
  title?: string;
  className?: string;
}

export function HelpPanel({ items, title = 'How can we help?', className }: HelpPanelProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-24 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-grace-coffee text-white shadow-elevated hover:bg-grace-text lg:bottom-8',
          className
        )}
        aria-label="Open help"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-grace-text/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="help-panel-title">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-elevated">
            <div className="flex items-start justify-between gap-3">
              <h2 id="help-panel-title" className="text-lg font-bold text-grace-text">
                {title}
              </h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-grace-sand" aria-label="Close help">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {items.map((item, i) => (
                <div key={item.question} className="rounded-xl border border-grace-border">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-grace-text"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    aria-expanded={expanded === i}
                  >
                    {item.question}
                    <span className="text-grace-muted">{expanded === i ? '−' : '+'}</span>
                  </button>
                  {expanded === i && (
                    <p className="border-t border-grace-border px-4 py-3 text-sm text-grace-muted">{item.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function FaqAccordion({ items }: { items: HelpItem[] }) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.question} className="rounded-xl border border-grace-border bg-white">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 px-4 py-4 text-left font-medium text-grace-text"
            onClick={() => setExpanded(expanded === i ? null : i)}
            aria-expanded={expanded === i}
          >
            {item.question}
            <span className="text-grace-sandal">{expanded === i ? '−' : '+'}</span>
          </button>
          {expanded === i && (
            <p className="border-t border-grace-border px-4 py-3 text-sm leading-relaxed text-grace-muted">
              {item.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
