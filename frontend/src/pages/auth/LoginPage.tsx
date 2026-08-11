import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Loader2, AlertCircle, User, Building2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { getRoleDashboardPath } from '@/types';
import { DemoBadge } from '@/components/ui/DemoBadge';

const DEMO_CITIZEN = { email: 'citizen@grace.demo', password: 'Demo@1234' };
const DEMO_AUTHORITY = { email: 'authority@grace.demo', password: 'Demo@1234' };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'citizen' | 'authority' | null>(null);

  const redirectAfterLogin = (role: Parameters<typeof getRoleDashboardPath>[0]) => {
    navigate(from || getRoleDashboardPath(role), { replace: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ email, password });
      redirectAfterLogin(user.role);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg.includes('401') || msg.toLowerCase().includes('invalid') ? 'Invalid email or password.' : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type: 'citizen' | 'authority') => {
    const credentials = type === 'citizen' ? DEMO_CITIZEN : DEMO_AUTHORITY;
    setEmail(credentials.email);
    setPassword(credentials.password);
    setError('');
    setDemoLoading(type);
    try {
      const user = await login(credentials);
      redirectAfterLogin(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed. Ensure the backend is running.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <AuthLayout title="Welcome to GRACE AI" subtitle="Smart Grievance Resolution. Transparent Governance.">
      <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-elevated">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900">
              <Shield className="h-5 w-5 text-grace-cyan" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-navy-900">GRACE AI</p>
              <p className="text-xs text-navy-500">Smart Grievance Resolution</p>
            </div>
          </div>
          <DemoBadge />
        </div>

        <h2 className="text-2xl font-bold text-navy-900">Sign In</h2>
        <p className="mt-1 text-sm text-navy-500">Access your grievance portal</p>

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy-700">Email</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field mt-1" placeholder="you@example.com" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-navy-700">Password</label>
            <div className="relative mt-1">
              <input id="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading || demoLoading !== null} className="btn-primary w-full disabled:opacity-60">
            {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>) : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-navy-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-grace-blue hover:underline">Register</Link>
        </p>

        <div className="mt-8 border-t border-navy-100 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Demo Access</p>
            <DemoBadge />
          </div>
          <div className="space-y-3">
            <DemoCard type="citizen" loading={demoLoading === 'citizen'} disabled={loading || demoLoading !== null} onClick={() => handleDemoLogin('citizen')} />
            <DemoCard type="authority" loading={demoLoading === 'authority'} disabled={loading || demoLoading !== null} onClick={() => handleDemoLogin('authority')} />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

function DemoCard({ type, loading, disabled, onClick }: { type: 'citizen' | 'authority'; loading: boolean; disabled: boolean; onClick: () => void }) {
  const isCitizen = type === 'citizen';
  return (
    <div className="rounded-lg border border-navy-100 bg-navy-50 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-navy-800">
        {isCitizen ? <User className="h-4 w-4 text-grace-blue" /> : <Building2 className="h-4 w-4 text-grace-cyan" />}
        {isCitizen ? 'Citizen Demo' : 'Authority Demo'}
      </div>
      <p className="mt-1 text-xs text-navy-600">{isCitizen ? 'citizen@grace.demo' : 'authority@grace.demo'} / Demo@1234</p>
      <button type="button" onClick={onClick} disabled={disabled} className={`mt-3 w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${isCitizen ? 'bg-grace-blue text-white hover:bg-blue-700' : 'border border-grace-cyan bg-grace-cyan/10 text-grace-cyan hover:bg-grace-cyan/20'}`}>
        {loading ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Entering...</span>) : isCitizen ? 'Enter Citizen Demo' : 'Enter Authority Demo'}
      </button>
    </div>
  );
}
