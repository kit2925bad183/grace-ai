import { useEffect, useState } from 'react';
import { listAuditLogs, type AuditLogItem } from '@/services/adminService';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    listAuditLogs()
      .then((r) => setLogs(r.items))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Audit Logs" subtitle="Privileged platform actions recorded for accountability." />
      {error && <div className="card text-grace-critical">{error}</div>}
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-grace-border text-grace-muted">
              <th className="py-2">Time</th><th>Admin</th><th>Action</th><th>Target</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-b border-grace-border/50">
                <td className="py-3 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                <td>{log.userId?.name ?? 'System'}</td>
                <td>{log.action}</td>
                <td>{log.resourceType}{log.resourceId ? ` · ${log.resourceId}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
