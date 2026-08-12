import { useEffect, useState } from 'react';
import { getPlatformHealth } from '@/services/adminService';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AdminHealthPage() {
  const [health, setHealth] = useState<Record<string, { status: string; label: string; detail?: string }> | null>(null);

  useEffect(() => {
    getPlatformHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Platform Health" subtitle="Live service status from the backend." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {health && Object.entries(health).map(([key, svc]) => (
          <div key={key} className="card">
            <p className="font-medium text-grace-text">{svc.label}</p>
            <p className={`mt-2 text-sm ${svc.status === 'healthy' ? 'text-grace-success' : 'text-grace-warning'}`}>
              ● {svc.status === 'healthy' ? 'Healthy' : svc.detail ?? 'Degraded'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
