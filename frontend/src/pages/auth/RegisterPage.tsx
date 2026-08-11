import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { getRoleDashboardPath } from '@/types';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = 'Name is required';
    else if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid email format';

    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (form.phone && form.phone.length < 10)
      newErrors.phone = 'Phone must be at least 10 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      navigate(getRoleDashboardPath(user.role), { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <AuthLayout
      title="Join GRACE AI"
      subtitle="Register as a citizen to submit and track grievances with transparent governance."
    >
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
        <p className="mt-1 text-sm text-navy-500">Register as a citizen to file grievances</p>

        {submitError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field
            id="name"
            label="Full Name"
            value={form.name}
            onChange={(v) => updateField('name', v)}
            error={errors.name}
            placeholder="Your full name"
            required
          />
          <Field
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => updateField('email', v)}
            error={errors.email}
            placeholder="you@example.com"
            required
          />
          <Field
            id="phone"
            label="Phone (optional)"
            type="tel"
            value={form.phone}
            onChange={(v) => updateField('phone', v)}
            error={errors.phone}
            placeholder="9876543210"
          />
          <Field id="password" label="Password" type="password" value={form.password} onChange={(v) => updateField('password', v)} error={errors.password} placeholder="Minimum 8 characters" required hint="At least 8 characters" />
          <Field
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={(v) => updateField('confirmPassword', v)}
            error={errors.confirmPassword}
            placeholder="Re-enter password"
            required
          />

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-navy-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-grace-blue hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

function Field({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-navy-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-field mt-1 ${error ? 'input-error' : ''}`}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-navy-500">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}
