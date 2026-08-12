import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Shield, Loader2, AlertCircle, Eye, EyeOff, User, Building2, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { getRoleDashboardPath } from '@/types';

const QUICK_USER = { email: 'citizen@grace.demo', password: 'Demo@1234' };
const QUICK_HEAD = { email: 'head@grace.demo', password: 'Demo@1234' };
const QUICK_DEPARTMENT = { email: 'roads@grace.ai', password: 'Demo@1234' };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState<'user' | 'department' | 'head' | null>(null);

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError === 'google_auth_failed') setError('Google Sign-In failed. Please try again.');
    else if (urlError === 'google_not_configured') setError('Google Sign-In is not configured.');
    if (searchParams.get('verified') === '1') setSuccess('Email verified. You can sign in now.');
    if (searchParams.get('reset') === '1') setSuccess('Password reset. Please sign in.');
  }, [searchParams]);

  const redirectAfterLogin = (role: Parameters<typeof getRoleDashboardPath>[0]) => {
    navigate(from || getRoleDashboardPath(role), { replace: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const result = await login({ email, password });
      redirectAfterLogin(result.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (type: 'user' | 'department' | 'head') => {
    const credentials =
      type === 'user' ? QUICK_USER : type === 'department' ? QUICK_DEPARTMENT : QUICK_HEAD;
    setQuickLoading(type);
    try {
      const result = await login(credentials);
      redirectAfterLogin(result.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setQuickLoading(null);
    }
  };

  return (
    <AuthLayout title="Smart Governance." subtitle="Better Communities.">
      <div className="card">
        <div className="mb-4 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic-primary">
            <Shield className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <p className="font-bold text-civic-text">GRACE AI</p>
        </div>

        <h2 className="text-2xl font-bold text-grace-text">Welcome Back</h2>
        <p className="mt-1 text-base text-grace-muted">Sign in to your GRACE AI portal</p>

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-civic-critical">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}
        {success && <div role="status" className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-civic-success">{success}</div>}

        <div className="mt-6">
          <GoogleSignInButton disabled={loading || quickLoading !== null} />
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-civic-border" /></div>
          <div className="relative flex justify-center text-sm"><span className="bg-white px-3 text-civic-muted">or continue with email</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-base font-medium text-civic-text">Email</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="text-base font-medium text-civic-text">Password</label>
              <Link to="/forgot-password" className="text-sm font-medium text-civic-primary hover:underline">Forgot?</Link>
            </div>
            <div className="relative">
              <input id="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] text-civic-muted" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading || quickLoading !== null} className="btn-primary w-full">
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />Signing in...</> : 'Continue with Email'}
          </button>
        </form>

        <p className="mt-4 flex items-center justify-center gap-1 text-xs text-civic-muted">
          <Lock className="h-3 w-3" aria-hidden="true" /> Your information is securely protected.
        </p>

        <p className="mt-4 text-center text-sm text-civic-muted">
          New here? <Link to="/register" className="font-semibold text-civic-primary hover:underline">Create account</Link>
        </p>

        <div className="mt-8 border-t border-civic-border pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-civic-muted">Quick access</p>
          <div className="space-y-3">
            <QuickCard type="user" loading={quickLoading === 'user'} disabled={loading || quickLoading !== null} onClick={() => handleQuickLogin('user')} />
            <QuickCard type="department" loading={quickLoading === 'department'} disabled={loading || quickLoading !== null} onClick={() => handleQuickLogin('department')} />
            <QuickCard type="head" loading={quickLoading === 'head'} disabled={loading || quickLoading !== null} onClick={() => handleQuickLogin('head')} />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

function QuickCard({ type, loading, disabled, onClick }: { type: 'user' | 'department' | 'head'; loading: boolean; disabled: boolean; onClick: () => void }) {
  const label =
    type === 'user' ? 'Citizen Portal' : type === 'department' ? 'Department Portal' : 'System Head';
  const Icon = type === 'user' ? User : Building2;
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex w-full items-center gap-3 rounded-xl border border-civic-border bg-civic-mint/30 p-4 text-left transition hover:bg-civic-mint/60 disabled:opacity-60">
      <Icon className="h-5 w-5 text-civic-primary" aria-hidden="true" />
      <span className="flex-1 text-sm font-medium text-civic-text">{label}</span>
      {loading && <Loader2 className="h-4 w-4 animate-spin text-civic-primary" aria-hidden="true" />}
    </button>
  );
}
