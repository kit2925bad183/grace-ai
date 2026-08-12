export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 rounded bg-navy-100" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-navy-100" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-navy-100" />
    </div>
  );
}

export function ComplaintListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-48 rounded bg-navy-100" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-24 rounded-xl bg-navy-100" />
      ))}
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="animate-pulse space-y-4 pl-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="h-8 w-8 rounded-full bg-navy-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-navy-100" />
            <div className="h-3 w-48 rounded bg-navy-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-20 rounded-xl bg-navy-100" />
      ))}
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 w-72 rounded bg-navy-100" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-navy-100" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-xl bg-navy-100" />
        <div className="h-72 rounded-xl bg-navy-100" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return <div className="h-72 animate-pulse rounded-xl bg-navy-100" />;
}

export function RecommendationSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 rounded-xl bg-navy-100" />
      ))}
    </div>
  );
}

export function HotspotSkeleton() {
  return (
    <div className="grid animate-pulse gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-28 rounded-xl bg-navy-100" />
      ))}
    </div>
  );
}

export function AIAnalysisLoader({ step }: { step: number }) {
  const steps = [
    'Understanding your complaint...',
    'Finding the right department...',
    'Checking similar complaints...',
    'Estimating resolution time...',
  ];

  return (
    <div className="card-mint animate-fade-in">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-civic-primary border-t-transparent" aria-hidden="true" />
        <div>
          <p className="font-semibold text-civic-text">GRACE is analyzing...</p>
          <p className="text-sm text-civic-muted">This only takes a moment</p>
        </div>
      </div>
      <div className="space-y-2">
        {steps.map((label, i) => (
          <div
            key={label}
            className={`flex items-center gap-2 text-sm transition-opacity ${
              i <= step ? 'text-civic-text opacity-100' : 'text-civic-muted opacity-40'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${i <= step ? 'bg-civic-primary' : 'bg-civic-border'}`}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
