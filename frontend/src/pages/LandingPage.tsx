import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Copy,
  FileText,
  Lock,
  Route,
  Shield,
  Sparkles,
  Timer,
  Users,
} from 'lucide-react';
import { BrandLogo, GRACE_TAGLINE } from '@/components/brand/BrandLogo';
import { AppFooter } from '@/components/layout/AppFooter';
import { useAuth } from '@/contexts/AuthContext';
import { useLiveGovernanceStats } from '@/hooks/useLiveGovernanceStats';

const features = [
  {
    icon: Sparkles,
    title: 'AI Complaint Classification',
    desc: 'GRACE AI understands your complaint and routes it intelligently.',
  },
  {
    icon: Route,
    title: 'Smart Department Routing',
    desc: 'Complaints reach the responsible department automatically.',
  },
  {
    icon: Copy,
    title: 'Duplicate Detection',
    desc: 'Similar complaints are identified to avoid repeated work.',
  },
  {
    icon: Timer,
    title: 'SLA Prediction',
    desc: 'Transparent timelines and risk indicators for every case.',
  },
  {
    icon: FileText,
    title: 'Transparent Tracking',
    desc: 'Citizens follow every status change in real time.',
  },
  {
    icon: BarChart3,
    title: 'Data-Driven Governance',
    desc: 'Departments and leadership act on live MongoDB analytics.',
  },
];

const steps = [
  { n: '1', title: 'Report', desc: 'Describe the public issue clearly' },
  { n: '2', title: 'AI Understands', desc: 'GRACE classifies and routes the complaint' },
  { n: '3', title: 'Department Acts', desc: 'Officers assign, investigate and resolve' },
  { n: '4', title: 'Citizen Tracks', desc: 'Follow progress until resolution' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const { stats, loading } = useLiveGovernanceStats();

  return (
    <div className="min-h-screen bg-grace-sand">
      <header className="border-b border-grace-border bg-white">
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
        <section className="border-b border-grace-border bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-label">AI-Powered Grievance Redressal</p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-grace-text sm:text-5xl">
                for Smarter Governance
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-grace-muted">
                Submit, track and resolve public grievances with intelligent routing, SLA prediction
                and transparent real-time updates.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to={user ? '/user/complaints/new' : '/register'}
                  className="btn-primary min-w-[200px]"
                >
                  Submit a Grievance
                </Link>
                <Link to={user ? '/user/track' : '/login'} className="btn-outline min-w-[200px]">
                  Track Complaint
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

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-grace-text">How GRACE AI Works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="card text-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-grace-coffee text-sm font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 font-semibold text-grace-text">{s.title}</h3>
                <p className="mt-2 text-sm text-grace-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-grace-border bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-grace-text">Platform Features</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="card-interactive group">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-grace-sand">
                    <f.icon className="h-5 w-5 text-grace-coffee" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-grace-text">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-grace-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="card bg-grace-coffee text-white">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Built for trust & transparency</h2>
                <p className="mt-3 text-grace-sand/90">
                  Secure authentication, MongoDB-backed persistence, strict role-based access, and
                  AI-assisted analysis — designed for real public service.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-grace-sand">
                <TrustItem icon={Lock} text="Secure authentication (email + Google OAuth)" />
                <TrustItem icon={Shield} text="Role-based access enforced on the backend" />
                <TrustItem icon={Users} text="Multi-user safe — each citizen sees only their data" />
                <TrustItem icon={Sparkles} text="AI-assisted analysis (rule-based demo engine)" />
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-grace-sandal px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              Create your account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <AppFooter tagline={GRACE_TAGLINE} />
    </div>
  );
}

function LiveStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-grace-border bg-grace-sand px-4 py-3 text-center">
      <p className="text-xl font-bold text-grace-coffee">{value}</p>
      <p className="mt-1 text-xs text-grace-muted">{label}</p>
    </div>
  );
}

function TrustItem({ icon: Icon, text }: { icon: typeof Lock; text: string }) {
  return (
    <li className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-grace-sandal" aria-hidden="true" />
      {text}
    </li>
  );
}
