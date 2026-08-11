import { useEffect, useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, CheckCircle2, AlertCircle } from 'lucide-react';
import { getCategories, getWards, analyzeGrievance, submitGrievance } from '@/services/grievanceService';
import { useToast } from '@/contexts/ToastContext';
import type { Category, Ward, AIAnalysisResult, Priority, SubmitGrievanceResponse } from '@/types/grievance';
import { AIAnalysisLoader } from '@/components/skeletons/Skeletons';
import { PriorityBadge } from '@/components/grievance/GrievanceBadges';

const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function RegisterGrievancePage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    wardId: '',
    location: '',
    priority: 'MEDIUM' as Priority,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<SubmitGrievanceResponse | null>(null);

  const [metaError, setMetaError] = useState('');

  useEffect(() => {
    Promise.all([getCategories(), getWards()])
      .then(([cats, ws]) => {
        setCategories(cats);
        setWards(ws);
        setMetaError('');
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Failed to load form data';
        setMetaError(message);
        toastError(message);
      })
      .finally(() => setLoadingMeta(false));
  }, []);

  useEffect(() => {
    setAnalysis(null);
  }, [form.title, form.description, form.categoryId, form.wardId, form.location]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim() || form.title.length < 5) e.title = 'Title must be at least 5 characters';
    if (!form.description.trim() || form.description.length < 20)
      e.description = 'Description must be at least 20 characters';
    if (!form.categoryId) e.categoryId = 'Category is required';
    if (!form.wardId) e.wardId = 'Ward is required';
    if (!form.location.trim() || form.location.length < 3) e.location = 'Location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validate()) return;
    setAnalyzing(true);
    setAnalysis(null);
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep((s) => Math.min(s + 1, 6));
    }, 400);

    try {
      const result = await analyzeGrievance(form);
      setAnalysis(result);
      success('AI analysis completed');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      clearInterval(stepInterval);
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!analysis) {
      toastError('Please run AI analysis before submitting');
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitGrievance(form);
      setSubmitted(result);
      success('Grievance submitted successfully');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Unable to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMeta) {
    return <div className="animate-pulse h-96 rounded-xl bg-navy-100" />;
  }

  if (metaError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700" role="alert">
        {metaError}
      </div>
    );
  }

  if (submitted?.grievance) {
    const g = submitted.grievance;
    return (
      <div className="mx-auto max-w-lg">
        <div className="card text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-grace-success" />
          <h2 className="mt-4 text-2xl font-bold text-navy-900">Grievance Submitted Successfully</h2>
          <p className="mt-2 text-navy-600">Your grievance has been registered.</p>
          <div className="mt-6 space-y-3 rounded-lg bg-navy-50 p-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-navy-500">Complaint ID</span>
              <span className="font-mono font-semibold text-navy-900">{g.grievanceId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">Status</span>
              <span className="font-medium">{g.status.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">Department</span>
              <span className="font-medium">{g.departmentId.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">SLA</span>
              <span className="font-medium">
                {submitted.aiAnalysis?.estimatedResolutionDays ?? '—'} days
              </span>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to={`/track/${g.grievanceId}`} className="btn-primary">Track Complaint</Link>
            <Link to="/citizen/complaints" className="btn-secondary">View My Complaints</Link>
            <Link to="/citizen/dashboard" className="btn-outline">Return to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Register Grievance</h1>
        <p className="mt-1 text-sm text-navy-500">Submit a new complaint with AI-powered classification</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <Field label="Title" error={errors.title} required>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-field"
            placeholder="Brief summary of the issue"
          />
        </Field>

        <Field label="Description" error={errors.description} required>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 1000) })}
            rows={4}
            maxLength={1000}
            className="input-field resize-none"
            placeholder="Describe the issue in detail..."
            aria-describedby="description-count"
          />
          <p id="description-count" className="mt-1 text-xs text-navy-500">{form.description.length} / 1000</p>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" error={errors.categoryId} required>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="input-field"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Ward" error={errors.wardId} required>
            <select
              value={form.wardId}
              onChange={(e) => setForm({ ...form, wardId: e.target.value })}
              className="input-field"
            >
              <option value="">Select ward</option>
              {wards.map((w) => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Location" error={errors.location} required>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input-field"
            placeholder="Street, landmark, area"
          />
        </Field>

        <Field label="Priority" required>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
            className="input-field"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={analyzing}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-grace-cyan/30 bg-grace-cyan/5 px-5 py-3 text-sm font-semibold text-grace-cyan transition-colors hover:bg-grace-cyan/10 disabled:opacity-60"
        >
          <Brain className="h-5 w-5" />
          {analyzing ? 'Analyzing...' : 'Analyze with GRACE AI'}
        </button>

        {analyzing && <AIAnalysisLoader step={analysisStep} />}

        {analysis && !analyzing && (
          <AnalysisPanel analysis={analysis} />
        )}

        <button
          type="submit"
          disabled={submitting || !analysis}
          className="btn-primary w-full disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit Grievance'}
        </button>
      </form>
    </div>
  );
}

function AnalysisPanel({ analysis }: { analysis: AIAnalysisResult }) {
  return (
    <div className="rounded-xl border border-grace-cyan/20 bg-gradient-to-br from-navy-50 to-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-navy-900">AI Demo Analysis</h3>
          <p className="text-xs text-grace-cyan">AI Method: Rule-Based Demo</p>
        </div>
        {analysis.hasSignificantDuplicate ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
            <AlertCircle className="h-3 w-3" /> Potential Duplicate
          </span>
        ) : (
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
            No Significant Duplicate Found
          </span>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Item label="Category" value={analysis.category} />
        <Item label="Department" value={analysis.department} />
        <Item label="Priority" value={<PriorityBadge priority={analysis.priority} />} />
        <Item label="Duplicate Probability" value={`${analysis.duplicateProbability}%`} />
        <Item label="SLA Risk" value={analysis.slaRisk} />
        <Item label="Estimated Resolution" value={`${analysis.estimatedResolutionDays} days`} />
        <Item label="AI Confidence" value={`${analysis.confidence}%`} />
      </div>
      {analysis.detectedKeywords.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-navy-500">Detected Keywords</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {analysis.detectedKeywords.map((kw) => (
              <span key={kw} className="rounded bg-navy-100 px-2 py-0.5 text-xs text-navy-700">{kw}</span>
            ))}
          </div>
        </div>
      )}
      <p className="mt-3 rounded-lg bg-grace-blue/5 p-3 text-sm text-navy-700">
        <span className="font-medium">Recommendation: </span>{analysis.recommendation}
      </p>
    </div>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-navy-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-navy-900">{value}</p>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-navy-700">
        {label}{required && ' *'}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
