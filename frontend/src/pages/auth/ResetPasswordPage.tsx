import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordStrength, isPasswordValid } from '@/components/auth/PasswordStrength';
import * as authService from '@/services/authService';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Reset link is invalid or missing.');
      return;
    }
    if (!isPasswordValid(password)) {
      setError('Password does not meet requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      navigate('/login?reset=1', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set New Password" subtitle="Choose a strong password for your GRACE AI account.">
      <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-elevated">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-grace-blue/10">
          <KeyRound className="h-6 w-6 text-grace-blue" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-navy-900">Reset Password</h2>
        <p className="mt-1 text-sm text-navy-500">Enter your new password below.</p>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-navy-700">New Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field mt-1" />
            {password && <PasswordStrength password={password} />}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy-700">Confirm Password</label>
            <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field mt-1" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</>) : 'Reset Password'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-navy-600">
          <Link to="/login" className="font-semibold text-grace-blue hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
