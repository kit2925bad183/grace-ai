import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Copy,
  Lock,
  Route,
  Shield,
  Sparkles,
  Timer,
  Users,
  Zap,
} from 'lucide-react';
import { BrandLogo, GRACE_TAGLINE } from '@/components/brand/BrandLogo';
import { AppFooter } from '@/components/layout/AppFooter';
import { useAuth } from '@/contexts/AuthContext';
import { useLiveGovernanceStats } from '@/hooks/useLiveGovernanceStats';
import {
  AGILE_FORCES_TEAM,
  GRACE_OBJECTIVES,
  GRACE_SUBTITLE,
  PROBLEM_STATEMENTS,
  WORKFLOW_STEPS,
} from '@/constants/graceIdentity';

const features = [
  {
    icon: Sparkles,
    title: 'AI Classification',
    desc: 'Automatically classify grievances by category, priority, and department.',
  },
  {
    icon: Route,
    title: 'Smart Routing',
    desc: 'Route complaints to the responsible department without manual triage.',
  },
  {
    icon: Timer,
    title: 'SLA Prediction',
    desc: 'Predict SLA violations with Safe, At Risk, and Critical indicators.',
  },
  {
    icon: Copy,
    title: 'Duplicate Detection',
    desc: 'Identify similar complaints to reduce repeated work.',
  },
  {
    icon: Zap,
    title: 'Real-Time Tracking',
    desc: 'Citizens follow every status change through a clear timeline.',
  },
  {
    icon: BarChart3,
    title: 'Authority Analytics',
    desc: 'Live MongoDB-backed insights for departments and leadership.',
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const { stats, loading } = useLiveGovernanceStats();

  return (
    <div className="min-h-screen bg-civic-bg">
      <header className="sticky top-0 z-40 border-b border-civic-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo size="sm" to="/" />
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">
              Login
            </Link>
            <Link to="/register" className="btn-primary px-4 py-2 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-civic-border bg-gradient-to-b from-white to-civic-mint/40">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-cyan-200/20 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-800">
                <Shield className="h-4 w-4" aria-hidden="true" />
                Smart Governance Platform
              </div>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-civic-text sm:text-5xl lg:text-6xl">
                <span className="text-civic-primary">GRACE AI</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-civic-primary sm:text-xl">{GRACE_SUBTITLE}</p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-civic-muted sm:text-lg">
                Submit, track, and resolve public grievances with intelligent routing, SLA prediction,
                duplicate detection, and transparent real-time updates.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to={user ? '/user/complaints/new' : '/register'}
                  className="btn-primary min-w-[200px]"
                >
                  Submit a Grievance
                </Link>
                <Link to={user ? '/user/track' : '/login'} className="btn-outline min-w-[200px]">
                  Track Grievance
                </Link>
              </div>
            </div>

            {!loading && stats && (
              <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
                <LiveStat label="Total Grievances" value={stats.totalGrievances} />
                <LiveStat label="Resolved" value={stats.resolved} />
                <LiveStat label="In Progress" value={stats.inProgress} />
                <LiveStat label="SLA Compliance" value={`${stats.slaCompliance}%`} />
              </div>
            )}
          </div>
        </section>

        {/* Problem Statement */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="section-label">The Problem</p>
              <h2 className="mt-2 text-2xl font-bold text-civic-text sm:text-3xl">
                Traditional grievance systems fall short
              </h2>
              <p className="mt-4 text-civic-muted">
                GRACE AI addresses these challenges through AI-powered classification, smart routing,
                tracking, duplicate detection, SLA prediction, and analytics.
              </p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {PROBLEM_STATEMENTS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 rounded-lg border border-civic-border bg-white px-3 py-2.5 text-sm text-civic-text"
                >
                  <span className="mt-0.5 text-civic-critical" aria-hidden="true">
                    ×
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Objectives — exact wording required */}
        <section className="border-y border-civic-border bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="section-label text-center">Objectives</p>
            <h2 className="mt-2 text-center text-2xl font-bold text-civic-text">What GRACE AI delivers</h2>
            <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
              {GRACE_OBJECTIVES.map((objective, i) => (
                <li key={objective} className="card flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-civic-primary text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-sm font-medium text-civic-text sm:text-base">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Workflow */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-civic-text">End-to-End Workflow</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-civic-muted">
            From submission to resolution — every step is tracked and transparent.
          </p>
          <div className="mt-10 hidden justify-center gap-2 lg:flex">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center">
                <WorkflowNode step={i + 1} title={step.title} desc={step.desc} />
                {i < WORKFLOW_STEPS.length - 1 && (
                  <ArrowDown className="mx-2 h-5 w-5 rotate-[-90deg] text-civic-primary" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 space-y-4 lg:hidden">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.key}>
                <WorkflowNode step={i + 1} title={step.title} desc={step.desc} />
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="h-5 w-5 text-civic-primary" aria-hidden="true" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-civic-border bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-civic-text">Platform Features</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="card-interactive group">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-civic-mint">
                    <f.icon className="h-5 w-5 text-civic-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-civic-text">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-civic-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Results — real data only */}
        {!loading && stats && (
          <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-civic-text">Measurable Outcomes</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-civic-muted">
              Live metrics from the GRACE AI platform and MongoDB — not estimated figures.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <OutcomeCard
                title="Automated classification"
                desc="Every grievance is analyzed by GRACE AI on submission."
                metric={`${stats.totalGrievances} processed`}
              />
              <OutcomeCard
                title="Real-time tracking"
                desc="Status history stored for every grievance."
                metric={`${stats.inProgress} in progress`}
              />
              <OutcomeCard
                title="SLA monitoring"
                desc="Risk indicators tracked across active cases."
                metric={`${stats.slaAtRisk} at risk`}
              />
              <OutcomeCard
                title="Duplicate detection"
                desc="Similar complaints flagged for review."
                metric={`${stats.duplicateComplaints} flagged`}
              />
            </div>
          </section>
        )}

        {/* Trust */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="card overflow-hidden bg-gradient-to-br from-navy-800 to-navy-900 text-white">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Built for trust & transparency</h2>
                <p className="mt-3 text-teal-100/90">
                  Secure authentication, MongoDB-backed persistence, strict role-based access, and
                  AI-assisted analysis — designed for real public service.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-teal-50">
                <TrustItem icon={Lock} text="Secure authentication (email + Google OAuth)" />
                <TrustItem icon={Shield} text="Role-based access enforced on the backend" />
                <TrustItem icon={Users} text="Multi-user safe — each citizen sees only their data" />
                <TrustItem icon={Sparkles} text="AI-assisted analysis (rule-based intelligence engine)" />
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 font-semibold text-white hover:bg-teal-400"
            >
              Create your account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* About / Team */}
        <section id="about" className="border-t border-civic-border bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="section-label text-center">Project Team</p>
            <h2 className="mt-2 text-center text-2xl font-bold text-civic-text">AGILE FORCES</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-civic-muted">{GRACE_TAGLINE}</p>
            <ul className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
              {AGILE_FORCES_TEAM.map((member) => (
                <li key={member.register} className="card text-center">
                  <p className="font-semibold text-civic-text">{member.name}</p>
                  <p className="mt-1 font-mono text-xs text-civic-muted">{member.register}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <AppFooter tagline={GRACE_TAGLINE} />
    </div>
  );
}

function LiveStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-civic-border bg-white px-4 py-3 text-center shadow-card">
      <p className="text-xl font-bold text-civic-primary">{value}</p>
      <p className="mt-1 text-xs text-civic-muted">{label}</p>
    </div>
  );
}

function WorkflowNode({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="card max-w-[160px] flex-1 p-4 text-center">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-civic-primary text-xs font-bold text-white">
        {step}
      </span>
      <h3 className="mt-3 text-sm font-semibold text-civic-text">{title}</h3>
      <p className="mt-1 text-xs text-civic-muted">{desc}</p>
    </div>
  );
}

function OutcomeCard({ title, desc, metric }: { title: string; desc: string; metric: string }) {
  return (
    <div className="card">
      <CheckCircle2 className="h-5 w-5 text-civic-success" aria-hidden="true" />
      <h3 className="mt-3 font-semibold text-civic-text">{title}</h3>
      <p className="mt-1 text-sm text-civic-muted">{desc}</p>
      <p className="mt-3 text-lg font-bold text-civic-primary">{metric}</p>
    </div>
  );
}

function TrustItem({ icon: Icon, text }: { icon: typeof Lock; text: string }) {
  return (
    <li className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-teal-300" aria-hidden="true" />
      {text}
    </li>
  );
}
