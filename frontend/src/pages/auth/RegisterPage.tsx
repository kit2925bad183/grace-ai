import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Loader2, AlertCircle, MailCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { PasswordStrength, isPasswordValid } from '@/components/auth/PasswordStrength';
import * as authService from '@/services/authService';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState<{ email: string; message: string } | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    else if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    else if (!isPasswordValid(form.password)) newErrors.password = 'Password does not meet requirements';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (form.phone && form.phone.length < 10) newErrors.phone = 'Phone must be at least 10 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      setRegistered({ email: result.user.email, message: result.message });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registered) return;
    try {
      const message = await authService.resendVerification(registered.email);
      setRegistered({ ...registered, message });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to resend verification');
    }
  };

  if (registered) {
    return (
      <AuthLayout title="Verify Your Email" subtitle="One more step to activate your GRACE AI account.">
        <div className="rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-elevated">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <MailCheck className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-navy-900">Check your inbox</h2>
          <p className="mt-2 text-sm text-navy-600">{registered.message}</p>
          <p className="mt-2 text-sm text-navy-500">
            We sent a verification link to <strong>{registered.email}</strong>
          </p>
          <p className="mt-4 text-xs text-navy-400">
            In development, check the backend console for the verification link.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button type="button" onClick={handleResend} className="btn-secondary w-full">
              Resend verification email
            </button>
            <Link to="/login" className="btn-primary w-full text-center">
              Continue to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Join GRACE AI" subtitle="Register as a citizen to submit and track grievances with transparent governance.">
      <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-elevated">
        <div className="mb-6 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900">
            <Shield className="h-5 w-5 text-grace-cyan" />
          </div>
          <div>
            <p className="font-bold text-navy-900">GRACE AI</p>
            <p className="text-xs text-navy-500">Citizen Registration</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-navy-900">Create Account</h2>
        <p className="mt-1 text-sm text-navy-500">Register to file and track public grievances</p>

        {submitError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field id="name" label="Full Name" value={form.name} onChange={(v) => updateField('name', v)} error={errors.name} placeholder="Your full name" required />
          <Field id="email" label="Email" type="email" value={form.email} onChange={(v) => updateField('email', v)} error={errors.email} placeholder="you@example.com" required />
          <Field id="phone" label="Phone (optional)" type="tel" value={form.phone} onChange={(v) => updateField('phone', v)} error={errors.phone} placeholder="9876543210" />
          <div>
            <Field id="password" label="Password" type="password" value={form.password} onChange={(v) => updateField('password', v)} error={errors.password} placeholder="Create a strong password" required />
            {form.password && <PasswordStrength password={form.password} />}
          </div>
          <Field id="confirmPassword" label="Confirm Password" type="password" value={form.confirmPassword} onChange={(v) => updateField('confirmPassword', v)} error={errors.confirmPassword} placeholder="Re-enter password" required />

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>) : 'Create Account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-navy-100" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-navy-400">or</span></div>
        </div>

        <GoogleSignInButton disabled={loading} />

        <p className="mt-4 text-center text-sm text-navy-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-grace-blue hover:underline">Sign In</Link>
        </p>
      </div>
    </AuthLayout>
  );

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }
}

function Field({ id, label, type = 'text', value, onChange, error, placeholder, required }: {
  id: string; label: string; type?: string; value: string; onChange: (v: string) => void;
  error?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-navy-700">{label}</label>
      <input id={id} type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className={`input-field mt-1 ${error ? 'input-error' : ''}`} placeholder={placeholder} aria-invalid={!!error} />
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}
