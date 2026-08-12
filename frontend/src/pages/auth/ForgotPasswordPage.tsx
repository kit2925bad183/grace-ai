import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import * as authService from '@/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await authService.forgotPassword(email.trim().toLowerCase());
      setMessage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="We'll send you instructions to recover your account.">
      <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-elevated">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-grace-blue/10">
          <Mail className="h-6 w-6 text-grace-blue" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-navy-900">Forgot Password?</h2>
        <p className="mt-1 text-sm text-navy-500">Enter your email and we&apos;ll send reset instructions.</p>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy-700">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field mt-1" placeholder="you@example.com" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>) : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-navy-600">
          <Link to="/login" className="font-semibold text-grace-blue hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
