export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-800 ${className}`}
      title="This environment uses demonstration data"
    >
      DEMO ENVIRONMENT
    </span>
  );
}

export function DemoDataLabel({ className = '' }: { className?: string }) {
  return (
    <span className={`text-xs font-medium text-amber-700 ${className}`}>Demo Data</span>
  );
}
