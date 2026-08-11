import { useState } from 'react';
import {
  Shield,
  Brain,
  GitBranch,
  Clock,
  MapPin,
  BarChart3,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Menu,
  X,
  User,
  Building2,
  ArrowDown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { AppFooter } from '@/components/layout/AppFooter';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleDashboardPath } from '@/types';

const features = [
  { icon: Brain, title: 'AI Classification', description: 'Rule-based demo engine categorizes complaints and assigns the correct category and priority.' },
  { icon: GitBranch, title: 'Smart Routing', description: 'Intelligent routing sends grievances to the correct municipal department automatically.' },
  { icon: Search, title: 'Duplicate Detection', description: 'Identifies potential duplicate complaints to reduce redundant field work.' },
  { icon: Clock, title: 'SLA Prediction', description: 'Predicts resolution timelines and flags complaints at risk of breaching SLAs.' },
  { icon: MapPin, title: 'Citizen Tracking', description: 'Real-time grievance tracking with transparent status updates and notifications.' },
  { icon: BarChart3, title: 'Governance Analytics', description: 'MongoDB-backed trends, hotspots, root-cause intelligence, and governance recommendations.' },
];

const flowSteps = [
  'Citizen submits grievance',
  'AI analyzes complaint',
  'Smart department routing',
  'SLA risk prediction',
  'Authority action',
  'Transparent citizen tracking',
  'Governance analytics',
];

export default function LandingPage() {
  const { health, loading, error, refetch } = useHealthCheck();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'citizen' | 'authority' | null>(null);
  const [trackId, setTrackId] = useState('');

  const handleDemo = async (type: 'citizen' | 'authority') => {
    setDemoLoading(type);
    try {
      const creds = type === 'citizen'
        ? { email: 'citizen@grace.demo', password: 'Demo@1234' }
        : { email: 'authority@grace.demo', password: 'Demo@1234' };
      const user = await login(creds);
      navigate(getRoleDashboardPath(user.role), { replace: true });
    } catch {
      navigate('/login');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-50 via-white to-white">
      <header className="sticky top-0 z-50 border-b border-navy-100/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900">
              <Shield className="h-5 w-5 text-grace-cyan" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold text-navy-900">GRACE AI</p>
              <p className="text-xs text-navy-500">Smart Grievance Resolution. Transparent Governance.</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            <DemoBadge />
            <a href="#features" className="text-sm font-medium text-navy-600 hover:text-navy-900">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-navy-600 hover:text-navy-900">How It Works</a>
            <a href="#demo" className="text-sm font-medium text-navy-600 hover:text-navy-900">Demo Access</a>
            <a href="#status" className="text-sm font-medium text-navy-600 hover:text-navy-900">Status</a>
            <Link to="/login" className="text-sm font-medium text-navy-600 hover:text-navy-900">Sign In</Link>
            <Link to="/register" className="btn-primary px-4 py-2 text-sm">Register</Link>
          </nav>
          <button type="button" className="rounded-lg p-2 md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="border-t border-navy-100 px-4 py-4 md:hidden" aria-label="Mobile navigation">
            <div className="flex flex-col gap-3">
              <a href="#features" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-navy-700">Features</a>
              <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-navy-700">How It Works</a>
              <a href="#demo" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-navy-700">Demo Access</a>
              <Link to="/login" className="btn-primary text-center text-sm">Sign In</Link>
            </div>
          </nav>
        )}
      </header>

      <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            <DemoBadge />
            <span className="rounded-full border border-grace-cyan/20 bg-grace-cyan/5 px-4 py-1.5 text-sm font-medium text-grace-cyan">
              AI for Smart Governance &amp; Citizen Empowerment
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-navy-950 sm:text-5xl">
            GRACE AI
          </h1>
          <p className="mt-3 text-xl font-semibold text-navy-800 sm:text-2xl">
            AI-Powered Grievance Redressal &amp; SLA Enforcement Platform
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-grace-cyan">
            Smart Grievance Resolution. Transparent Governance.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-navy-600">
            Submit, track and resolve public grievances with intelligent routing, SLA prediction and transparent real-time updates — all persisted in MongoDB.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => handleDemo('citizen')} disabled={demoLoading !== null} className="btn-primary w-full sm:w-auto disabled:opacity-60">
              {demoLoading === 'citizen' ? 'Entering...' : 'Enter Citizen Demo'}
            </button>
            <button type="button" onClick={() => handleDemo('authority')} disabled={demoLoading !== null} className="btn-secondary w-full sm:w-auto disabled:opacity-60">
              {demoLoading === 'authority' ? 'Entering...' : 'Enter Authority Demo'}
            </button>
            <a href="#features" className="btn-outline w-full sm:w-auto">View Capabilities</a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-navy-100 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-navy-900">How GRACE AI Works</h2>
          <p className="mt-2 text-sm text-navy-500">End-to-end grievance lifecycle powered by MongoDB</p>
          <div className="mt-10 space-y-2">
            {flowSteps.map((step, i) => (
              <div key={step}>
                <div className="rounded-lg border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm font-medium text-navy-800">{step}</div>
                {i < flowSteps.length - 1 && (
                  <ArrowDown className="mx-auto my-1 h-4 w-4 text-grace-cyan" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-navy-400">Citizen → AI → Department → Resolution → Analytics</p>
        </div>
      </section>

      <section id="features" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-navy-900">Platform Capabilities</h2>
            <p className="mt-2 text-navy-600">Professional GovTech platform for transparent grievance redressal</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card transition-shadow hover:shadow-elevated">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-navy-900 text-grace-cyan">
                  <f.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-navy-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-navy-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="bg-navy-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Demo Access</h2>
            <p className="mt-2 text-sm text-navy-300">Use real authentication — demo accounts connect to MongoDB</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-2 font-medium"><User className="h-4 w-4 text-grace-cyan" />Citizen Demo</div>
              <p className="mt-2 text-sm text-navy-300">citizen@grace.demo</p>
              <p className="text-sm text-navy-400">Password: Demo@1234</p>
              <button type="button" onClick={() => handleDemo('citizen')} disabled={demoLoading !== null} className="btn-primary mt-4 w-full bg-grace-blue disabled:opacity-60">
                {demoLoading === 'citizen' ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Entering...</span> : 'Enter Citizen Demo'}
              </button>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-2 font-medium"><Building2 className="h-4 w-4 text-grace-cyan" />Authority Demo</div>
              <p className="mt-2 text-sm text-navy-300">authority@grace.demo</p>
              <p className="text-sm text-navy-400">Password: Demo@1234</p>
              <button type="button" onClick={() => handleDemo('authority')} disabled={demoLoading !== null} className="mt-4 w-full rounded-lg border border-grace-cyan bg-grace-cyan/10 px-4 py-2.5 text-sm font-semibold text-grace-cyan hover:bg-grace-cyan/20 disabled:opacity-60">
                {demoLoading === 'authority' ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Entering...</span> : 'Enter Authority Demo'}
              </button>
            </div>
          </div>
          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-medium">Track by Grievance ID (requires sign in)</p>
            <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); navigate('/login'); }}>
              <input value={trackId} onChange={(e) => setTrackId(e.target.value)} placeholder="GRV-2026-XXXX" className="input-field flex-1 font-mono uppercase text-navy-900" />
              <Link to="/login" className="btn-secondary text-center text-sm">Sign In to Track</Link>
            </form>
          </div>
        </div>
      </section>

      <section id="status" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="card">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-navy-900">System Status</h2>
                <p className="text-sm text-navy-500">Live connection to GRACE AI backend</p>
              </div>
              <button type="button" onClick={refetch} disabled={loading} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50">
                <RefreshCw className={`mr-1 inline h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh
              </button>
            </div>
            {loading && (<div className="flex items-center justify-center gap-3 py-8 text-navy-500"><Loader2 className="h-5 w-5 animate-spin" />Connecting...</div>)}
            {error && !loading && (<div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"><AlertCircle className="h-5 w-5 text-red-500" /><div><p className="font-medium text-red-800">Backend Unavailable</p><p className="text-sm text-red-700">{error}</p></div></div>)}
            {health && !loading && (
              <div className="space-y-4">
                <div className={`flex items-center gap-3 rounded-lg border p-4 ${health.status === 'ok' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                  {health.status === 'ok' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <div>
                    <p className={`font-medium ${health.status === 'ok' ? 'text-emerald-800' : 'text-amber-800'}`}>
                      {health.status === 'ok' ? 'Backend Connected' : 'Backend Degraded'}
                    </p>
                    <p className={`text-sm ${health.status === 'ok' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {health.service ?? 'GRACE AI API'} — {health.environment ?? 'unknown'}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatusItem label="API" value={health.status.toUpperCase()} />
                  <StatusItem label="Database" value={health.database === 'connected' ? 'Connected' : health.database} ok={health.database === 'connected'} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}

function StatusItem({ label, value, ok = true }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="rounded-lg bg-navy-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-navy-500">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${ok ? 'text-navy-900' : 'text-red-600'}`}>{value}</p>
    </div>
  );
}
