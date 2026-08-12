import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { getPlatformSettings, updatePlatformSettings, type PlatformSettings } from '@/services/adminService';
import { ErrorState } from '@/components/ui/ErrorState';
import { DashboardSkeleton } from '@/components/skeletons/Skeletons';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getPlatformSettings()
      .then(setSettings)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  async function save(updates: Partial<PlatformSettings>) {
    if (!settings) return;
    setSaving(true);
    setMessage('');
    try {
      const updated = await updatePlatformSettings(updates);
      setSettings(updated);
      setMessage('Settings saved successfully.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <DashboardSkeleton />;
  if (error || !settings) return <ErrorState title="Settings unavailable" message={error || 'Unknown error'} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="System Settings" subtitle="Configure platform behavior. Secrets remain in environment variables only." />

      {message && (
        <div className="rounded-xl border border-grace-border bg-grace-sand px-4 py-3 text-sm">{message}</div>
      )}

      <div className="card space-y-6">
        <section>
          <h2 className="font-semibold text-grace-text">Platform Identity</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              Platform Name
              <input
                type="text"
                defaultValue={settings.platformName}
                onBlur={(e) => e.target.value !== settings.platformName && save({ platformName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-grace-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Support Email
              <input
                type="email"
                defaultValue={settings.supportEmail}
                onBlur={(e) => e.target.value !== settings.supportEmail && save({ supportEmail: e.target.value })}
                className="mt-1 w-full rounded-xl border border-grace-border px-3 py-2"
              />
            </label>
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-grace-text">Access Controls</h2>
          <div className="mt-3 space-y-3">
            <Toggle label="Public Registration" checked={settings.registrationEnabled} onChange={(v) => save({ registrationEnabled: v })} disabled={saving} />
            <Toggle label="Google Sign-In" checked={settings.googleLoginEnabled} onChange={(v) => save({ googleLoginEnabled: v })} disabled={saving} />
            <Toggle label="Complaint Submission" checked={settings.complaintSubmissionEnabled} onChange={(v) => save({ complaintSubmissionEnabled: v })} disabled={saving} />
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-grace-text">AI Features</h2>
          <p className="mt-1 text-xs text-grace-muted">GRACE AI uses a rule-based demo inference engine (RULE_BASED_DEMO).</p>
          <div className="mt-3 space-y-3">
            <Toggle label="AI Analysis" checked={settings.aiAnalysisEnabled} onChange={(v) => save({ aiAnalysisEnabled: v })} disabled={saving} />
            <Toggle label="Duplicate Detection" checked={settings.duplicateDetectionEnabled} onChange={(v) => save({ duplicateDetectionEnabled: v })} disabled={saving} />
            <Toggle label="Forecasting" checked={settings.forecastingEnabled} onChange={(v) => save({ forecastingEnabled: v })} disabled={saving} />
          </div>
        </section>

        <section className="rounded-xl border border-grace-warning/40 bg-grace-sand/50 p-4">
          <h2 className="font-semibold text-grace-text">Maintenance Mode</h2>
          <p className="mt-1 text-sm text-grace-muted">When enabled, public users see a maintenance message. Admins retain access.</p>
          <div className="mt-3 space-y-3">
            <Toggle label="Maintenance Mode" checked={settings.maintenanceMode} onChange={(v) => save({ maintenanceMode: v })} disabled={saving} danger />
            <label className="block text-sm">
              Maintenance Message
              <textarea
                defaultValue={settings.maintenanceMessage}
                rows={2}
                onBlur={(e) => e.target.value !== settings.maintenanceMessage && save({ maintenanceMessage: e.target.value })}
                className="mt-1 w-full rounded-xl border border-grace-border px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-grace-text">Security Notes</h2>
          <p className="mt-1 text-sm text-grace-muted">
            MongoDB URI, JWT secrets, and OAuth credentials are managed via environment variables only and are never exposed here.
            Enable MongoDB Atlas backups in your cloud provider for production deployments.
          </p>
        </section>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  disabled,
  danger,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-4 rounded-xl border border-grace-border px-4 py-3">
      <span className={`text-sm font-medium ${danger && checked ? 'text-grace-critical' : 'text-grace-text'}`}>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 rounded accent-grace-coffee"
      />
    </label>
  );
}
