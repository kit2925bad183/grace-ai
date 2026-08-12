import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import * as authService from '@/services/authService';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification link is invalid or missing.');
      return;
    }

    authService
      .verifyEmail(token)
      .then((msg) => {
        setStatus('success');
        setMessage(msg);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verification failed');
      });
  }, [token]);

  return (
    <AuthLayout title="Email Verification" subtitle="Confirming your GRACE AI account.">
      <div className="rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-elevated">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-grace-blue" />
            <h2 className="mt-4 text-xl font-bold text-navy-900">Verifying your email...</h2>
            <p className="mt-2 text-sm text-navy-500">Please wait while we confirm your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h2 className="mt-4 text-xl font-bold text-navy-900">Email verified successfully</h2>
            <p className="mt-2 text-sm text-navy-600">{message}</p>
            <Link to="/login?verified=1" className="btn-primary mt-6 inline-block">
              Continue to GRACE AI
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-bold text-navy-900">Verification failed</h2>
            <p className="mt-2 text-sm text-navy-600">{message}</p>
            <Link to="/login" className="btn-primary mt-6 inline-block">
              Continue to GRACE AI
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
