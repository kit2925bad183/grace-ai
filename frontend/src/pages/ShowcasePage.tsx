import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  LogIn,
  Play,
  Shield,
  Users,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { AppFooter } from '@/components/layout/AppFooter';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import {
  AGILE_FORCES_TEAM,
  GRACE_OBJECTIVES,
  GRACE_SUBTITLE,
  WORKFLOW_STEPS,
} from '@/constants/graceIdentity';
import { DEMO_ACCOUNTS, DEMO_PASSWORD, DEMO_SAMPLE_GRIEVANCE } from '@/constants/demoAccounts';
import {
  DEPLOYMENT_LINKS,
  FULL_SHOWCASE_WORKFLOW,
  JUDGE_DEMO_TIMELINE,
  POSTER_WORKFLOW,
  type ShowcaseRole,
} from '@/constants/showcaseWorkflow';
import { getRoleDashboardPath } from '@/types';
import { cn } from '@/utils/cn';

type QuickKey = (typeof DEMO_ACCOUNTS)[number]['key'];

const ROLE_FILTERS: { id: ShowcaseRole; label: string }[] = [
  { id: 'all', label: 'Full journey' },
  { id: 'citizen', label: 'Citizen' },
  { id: 'department', label: 'Department' },
  { id: 'head', label: 'Head' },
  { id: 'admin', label: 'Admin' },
];

export default function ShowcasePage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { health, loading: healthLoading } = useHealthCheck();
  const [roleFilter, setRoleFilter] = useState<ShowcaseRole>('all');
  const [quickLoading, setQuickLoading] = useState<QuickKey | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');

  const filteredSteps =
    roleFilter === 'all'
      ? FULL_SHOWCASE_WORKFLOW
      : FULL_SHOWCASE_WORKFLOW.filter((s) => s.role === 'all' || s.role === roleFilter);

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleQuickLogin = async (key: QuickKey) => {
    const account = DEMO_ACCOUNTS.find((a) => a.key === key);
    if (!account) return;
    setLoginError('');
    setQuickLoading(key);
    try {
      const result = await login({ email: account.email, password: DEMO_PASSWORD });
      navigate(getRoleDashboardPath(result.user.role), { replace: true });
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Demo login failed. Run npm run seed locally.');
    } finally {
      setQuickLoading(null);
    }
  };

  const dbOk = health?.database === 'connected';

  return (
    <div className="min-h-screen bg-civic-bg">
      <header className="sticky top-0 z-40 border-b border-civic-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo size="sm" to="/" />
          <nav className="flex items-center gap-3">
            <Link to="/status" className="btn-ghost text-sm">
              System Status
            </Link>
            <Link to="/login" className="btn-primary px-4 py-2 text-sm">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-civic-border bg-gradient-to-b from-white to-civic-mint/30 py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-800">
                <Play className="h-4 w-4" aria-hidden="true" />
                Live Demo Guide
              </span>
              <h1 className="mt-6 text-3xl font-extrabold text-civic-text sm:text-4xl lg:text-5xl">
                GRACE AI — Full Showcase Workflow
              </h1>
              <p className="mt-4 text-lg text-civic-muted">{GRACE_SUBTITLE}</p>
              <p className="mt-3 text-sm text-civic-muted">
                Step-by-step script for judges, mentors, and demos. Password for all demo accounts:{' '}
                <CopyChip label="password" value={DEMO_PASSWORD} copied={copied} onCopy={copyText} />
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <StatusPill
                  loading={healthLoading}
                  ok={dbOk}
                  label={dbOk ? 'Database connected' : 'Database unavailable — seed & connect MongoDB'}
                />
                {user && (
                  <Link to={getRoleDashboardPath(user.role)} className="btn-primary gap-2">
                    Continue as {user.name} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick login + credentials */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-bold text-civic-text">One-click demo login</h2>
              <p className="mt-2 text-sm text-civic-muted">
                Requires seeded data. From repo root: <code className="rounded bg-civic-mint px-1.5 py-0.5 text-xs">npm run seed</code>
              </p>
              {loginError && (
                <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {loginError}
                </p>
              )}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.key}
                    type="button"
                    onClick={() => handleQuickLogin(account.key)}
                    disabled={quickLoading !== null}
                    className="card-interactive flex flex-col items-start gap-2 p-4 text-left disabled:opacity-60"
                  >
                    <span className="flex w-full items-center justify-between">
                      <span className="font-semibold text-civic-text">{account.label}</span>
                      {quickLoading === account.key ? (
                        <Loader2 className="h-4 w-4 animate-spin text-civic-primary" />
                      ) : (
                        <LogIn className="h-4 w-4 text-civic-primary" />
                      )}
                    </span>
                    <span className="font-mono text-xs text-civic-muted">{account.email}</span>
                    <span className="text-xs text-civic-muted">{account.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-civic-text">Demo credentials</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-civic-border bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-civic-mint/40 text-left text-xs uppercase tracking-wide text-civic-muted">
                    <tr>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Portal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-civic-border">
                    {DEMO_ACCOUNTS.map((a) => (
                      <tr key={a.key}>
                        <td className="px-4 py-3 font-medium text-civic-text">{a.label}</td>
                        <td className="px-4 py-3">
                          <CopyChip label={a.key} value={a.email} copied={copied} onCopy={copyText} />
                        </td>
                        <td className="hidden px-4 py-3 font-mono text-xs text-civic-muted sm:table-cell">
                          {a.portal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-civic-muted">
                Sample track ID (seeded):{' '}
                <CopyChip
                  label="grv"
                  value={DEMO_SAMPLE_GRIEVANCE.trackId}
                  copied={copied}
                  onCopy={copyText}
                />
              </p>
            </div>
          </div>
        </section>

        {/* 5-min timeline */}
        <section className="border-y border-civic-border bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-civic-text">5-Minute Judge Demo</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-civic-muted">
              Condensed script — expand with the full workflow below.
            </p>
            <ol className="mx-auto mt-10 max-w-3xl space-y-4">
              {JUDGE_DEMO_TIMELINE.map((item) => (
                <li key={item.time} className="flex gap-4">
                  <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-civic-primary font-mono text-sm font-bold text-white">
                    {item.time}
                  </span>
                  <div>
                    <p className="font-semibold text-civic-text">{item.title}</p>
                    <p className="mt-0.5 text-sm text-civic-muted">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Poster journey */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-civic-text">Citizen Journey (Poster Flow)</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {POSTER_WORKFLOW.map((step, i) => (
              <div key={step.status} className="flex items-center">
                <div className="rounded-xl border border-civic-border bg-white px-4 py-3 text-center shadow-card">
                  <p className="text-xs font-bold uppercase text-civic-primary">Step {step.order}</p>
                  <p className="mt-1 text-sm font-semibold text-civic-text">{step.label}</p>
                  <p className="mt-0.5 max-w-[140px] text-xs text-civic-muted">{step.description}</p>
                </div>
                {i < POSTER_WORKFLOW.length - 1 && (
                  <ArrowRight className="mx-1 hidden h-4 w-4 text-civic-primary sm:block" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Platform workflow */}
        <section className="border-y border-civic-border bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-civic-text">Platform Workflow</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WORKFLOW_STEPS.map((step, i) => (
                <div key={step.key} className="card">
                  <span className="text-xs font-bold text-civic-primary">Phase {i + 1}</span>
                  <p className="mt-1 font-semibold text-civic-text">{step.title}</p>
                  <p className="mt-1 text-sm text-civic-muted">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Full step-by-step */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-civic-text">Complete Step-by-Step Workflow</h2>
              <p className="mt-1 text-sm text-civic-muted">{filteredSteps.length} steps in this view</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ROLE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setRoleFilter(f.id)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition',
                    roleFilter === f.id
                      ? 'bg-civic-primary text-white'
                      : 'border border-civic-border bg-white text-civic-muted hover:bg-civic-mint/40'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <ol className="mt-8 space-y-6">
            {filteredSteps.map((step) => (
              <li key={step.id} className="card relative pl-4 sm:pl-6">
                <span
                  className="absolute left-0 top-6 h-[calc(100%+1.5rem)] w-0.5 bg-civic-border last:hidden"
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-civic-primary text-sm font-bold text-white">
                      {step.id}
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-civic-primary">
                        {step.phase}
                        {step.highlight && (
                          <span className="ml-2 font-mono normal-case text-civic-muted">· {step.highlight}</span>
                        )}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-civic-text">{step.title}</h3>
                      <ul className="mt-3 space-y-2">
                        {step.actions.map((action) => (
                          <li key={action} className="flex gap-2 text-sm text-civic-muted">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-civic-success" aria-hidden="true" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {step.path && (
                    <Link
                      to={step.path}
                      className="btn-outline shrink-0 gap-2 self-start text-sm"
                    >
                      Open <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Objectives + team + links */}
        <section className="border-t border-civic-border bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-xl font-bold text-civic-text">Core Objectives</h2>
                <ul className="mt-4 space-y-2">
                  {GRACE_OBJECTIVES.map((obj, i) => (
                    <li key={obj} className="flex gap-2 text-sm text-civic-text">
                      <span className="font-bold text-civic-primary">{i + 1}.</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-civic-text">
                  <Users className="h-5 w-5 text-civic-primary" /> AGILE FORCES
                </h2>
                <ul className="mt-4 space-y-2">
                  {AGILE_FORCES_TEAM.map((m) => (
                    <li key={m.register} className="flex justify-between text-sm">
                      <span className="font-medium text-civic-text">{m.name}</span>
                      <span className="font-mono text-civic-muted">{m.register}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-civic-border bg-civic-mint/20 p-6">
              <h2 className="flex items-center gap-2 font-bold text-civic-text">
                <Shield className="h-5 w-5 text-civic-primary" /> Deployment links
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <span className="text-civic-muted">Frontend: </span>
                  <a href={DEPLOYMENT_LINKS.frontend} className="font-medium text-civic-primary hover:underline" target="_blank" rel="noreferrer">
                    {DEPLOYMENT_LINKS.frontend}
                  </a>
                </li>
                <li>
                  <span className="text-civic-muted">API: </span>
                  <a href={DEPLOYMENT_LINKS.api} className="font-medium text-civic-primary hover:underline" target="_blank" rel="noreferrer">
                    {DEPLOYMENT_LINKS.api}
                  </a>
                </li>
                <li>
                  <span className="text-civic-muted">Health: </span>
                  <a href={DEPLOYMENT_LINKS.health} className="font-medium text-civic-primary hover:underline" target="_blank" rel="noreferrer">
                    {DEPLOYMENT_LINKS.health}
                  </a>
                </li>
              </ul>
              {!dbOk && !healthLoading && (
                <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                  Production API is up but MongoDB is not connected. Set MONGODB_URI on Render, allow Atlas IP
                  0.0.0.0/0, then run seed against Atlas for live demo accounts.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      <AppFooter tagline="Smart Governance. Better Communities." />
    </div>
  );
}

function CopyChip({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(value, label)}
      className="inline-flex items-center gap-1 rounded-md bg-civic-mint/60 px-2 py-0.5 font-mono text-xs text-civic-text hover:bg-civic-mint"
    >
      {value}
      {copied === label ? (
        <CheckCircle2 className="h-3 w-3 text-civic-success" />
      ) : (
        <Copy className="h-3 w-3 text-civic-muted" />
      )}
    </button>
  );
}

function StatusPill({ loading, ok, label }: { loading: boolean; ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium',
        loading && 'bg-civic-border text-civic-muted',
        !loading && ok && 'bg-green-100 text-green-800',
        !loading && !ok && 'bg-amber-100 text-amber-900'
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : ok ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
      {label}
    </span>
  );
}
