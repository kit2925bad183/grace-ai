import { useEffect, useState, FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, CheckCircle2, ChevronLeft, ChevronRight, ImagePlus } from 'lucide-react';
import { getCategories, getWards, analyzeGrievance, submitGrievance } from '@/services/grievanceService';
import { useToast } from '@/contexts/ToastContext';
import type { Category, Ward, AIAnalysisResult, Priority, SubmitGrievanceResponse } from '@/types/grievance';
import { AIAnalysisLoader } from '@/components/skeletons/Skeletons';
import {
  friendlyDepartment,
  friendlyPriority,
} from '@/utils/civicLanguage';
import { cn } from '@/utils/cn';
import { usePortalPaths } from '@/utils/portalPaths';

const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STEPS = ['Problem', 'Location', 'GRACE AI', 'Review'];

export default function RegisterGrievancePage() {
  const location = useLocation();
  const paths = usePortalPaths();
  const draft = (location.state as { draft?: string })?.draft ?? '';
  const { success, error: toastError } = useToast();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: draft,
    categoryId: '',
    wardId: '',
    location: '',
    priority: 'MEDIUM' as Priority,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<SubmitGrievanceResponse | null>(null);
  const [showWritingHelp, setShowWritingHelp] = useState(false);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.title || form.description) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [form.title, form.description]);

  useEffect(() => {
    Promise.all([getCategories(), getWards()])
      .then(([cats, ws]) => { setCategories(cats); setWards(ws); })
      .catch((err) => setMetaError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoadingMeta(false));
  }, []);

  useEffect(() => { setAnalysis(null); }, [form.title, form.description, form.categoryId, form.wardId, form.location]);

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s >= 0) {
      if (!form.title.trim() || form.title.length < 5) e.title = 'Please add a short title (at least 5 characters)';
      if (!form.description.trim() || form.description.length < 20) e.description = 'Please describe the issue (at least 20 characters)';
    }
    if (s >= 1) {
      if (!form.location.trim()) e.location = 'Please tell us where this happened';
      if (!form.wardId) e.wardId = 'Please select your area';
      if (!form.categoryId) e.categoryId = 'Please select a category';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const runAnalysis = async () => {
    if (!validate(1)) { setStep(0); return; }
    setAnalyzing(true);
    setAnalysis(null);
    setAnalysisStep(0);
    const interval = setInterval(() => setAnalysisStep((s) => Math.min(s + 1, 3)), 500);
    try {
      const result = await analyzeGrievance(form);
      setAnalysis(result);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      clearInterval(interval);
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!analysis) {
      toastError('Please analyze your complaint first');
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitGrievance(form);
      setSubmitted(result);
      success('Your complaint has been submitted');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'We couldn\'t submit your complaint. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMeta) return <div className="h-64 animate-pulse rounded-2xl bg-civic-mint/50" aria-label="Loading" />;
  if (metaError) return <div className="card border-red-200 bg-red-50 text-civic-critical">{metaError}</div>;

  if (submitted?.grievance) {
    const g = submitted.grievance;
    return (
      <div className="mx-auto max-w-lg animate-fade-in">
        <div className="card text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-grace-success" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-bold text-grace-text">Your complaint has been submitted</h2>
          <div className="mt-6 rounded-xl bg-grace-sand p-4">
            <p className="text-sm text-grace-muted">Complaint ID</p>
            <p className="font-mono text-xl font-bold text-grace-coffee">{g.grievanceId}</p>
          </div>
          <div className="mt-6 text-left">
            <h3 className="font-semibold text-grace-text">What happens next?</h3>
            <ol className="mt-3 space-y-2 text-sm text-grace-muted">
              <li>1. GRACE AI analyzed your complaint</li>
              <li>2. It was sent to the responsible department</li>
              <li>3. A department officer will review it</li>
              <li>4. You can track progress anytime</li>
            </ol>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link to={`/track/${g.grievanceId}`} className="btn-primary">Track Complaint</Link>
            <Link to={paths.dashboard} className="btn-outline">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-civic-text">Report an issue</h1>
        <p className="mt-1 text-base text-civic-muted">We&apos;ll guide you step by step</p>
      </div>

      <StepIndicator current={step} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 0 && (
          <div className="card space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold">What happened?</h2>
            <Field label="Title" error={errors.title} required>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Example: There is a large pothole near the school entrance." />
            </Field>
            <Field label="Description" error={errors.description} required>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 1000) })} rows={5} className="input-field resize-none" placeholder="Describe what you see, when you noticed it, and how it affects people nearby..." />
            </Field>
            <button type="button" onClick={() => setShowWritingHelp(!showWritingHelp)} className="text-sm font-medium text-grace-coffee hover:underline">
              Not sure what to write?
            </button>
            {showWritingHelp && (
              <div className="rounded-xl bg-grace-sand p-4 text-sm text-grace-muted">
                <p>Include: what the problem is, where exactly it is, how long it has been there, and who it affects.</p>
                <p className="mt-2">Example: &quot;Deep pothole on Main Road near the school gate. Cars swerve dangerously. Present for 2 weeks.&quot;</p>
              </div>
            )}
            <NavButtons onBack={null} onNext={() => validate(0) && setStep(1)} nextLabel="Next: Location" />
          </div>
        )}

        {step === 1 && (
          <div className="card space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold">Where is the problem?</h2>
            <Field label="Location" error={errors.location} required>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="Street, landmark or area" />
            </Field>
            <Field label="Ward" error={errors.wardId} required>
              <select value={form.wardId} onChange={(e) => setForm({ ...form, wardId: e.target.value })} className="input-field">
                <option value="">Select your ward</option>
                {wards.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </Field>
            <Field label="Issue type" error={errors.categoryId} required>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-field">
                <option value="">What type of issue is this?</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="How urgent is it?">
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className="input-field">
                {PRIORITIES.map((p) => <option key={p} value={p}>{friendlyPriority(p)}</option>)}
              </select>
            </Field>
            <Field label="Photo (optional)">
              <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-grace-border p-6 hover:border-grace-coffee/40 hover:bg-grace-sand">
                <ImagePlus className="h-8 w-8 text-grace-muted" aria-hidden="true" />
                <span className="text-sm text-grace-muted">{imagePreview ? 'Change photo' : 'Tap to add a photo'}</span>
                <span className="text-xs text-grace-muted">Adding a photo helps the department understand faster.</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setImagePreview(URL.createObjectURL(f));
                }} />
              </label>
              {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 max-h-40 rounded-xl object-cover" />}
            </Field>
            <NavButtons onBack={() => setStep(0)} onNext={() => validate(1) && setStep(2)} nextLabel="Next: GRACE AI" />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="card">
              <h2 className="text-lg font-semibold">Let GRACE AI understand your complaint</h2>
              <p className="mt-1 text-sm text-grace-muted">We&apos;ll find the right department and check for similar complaints.</p>
            </div>
            {analyzing && <AIAnalysisLoader step={analysisStep} />}
            {analysis && !analyzing && (
              <div className="card-mint space-y-3">
                <h3 className="font-semibold text-grace-text">We&apos;ve understood your complaint</h3>
                <InsightRow label="Issue Type" value={analysis.category} />
                <InsightRow label="Responsible Department" value={friendlyDepartment(analysis.department)} />
                <InsightRow label="Priority" value={friendlyPriority(analysis.priority)} />
                <InsightRow label="Expected Resolution" value={`Approximately ${analysis.estimatedResolutionDays} days`} />
                <InsightRow label="SLA Risk" value={analysis.slaRisk === 'LOW' ? 'Low' : analysis.slaRisk === 'CRITICAL' ? 'High' : 'Medium'} />
                <InsightRow label="Similar Complaints" value={analysis.hasSignificantDuplicate ? `${analysis.potentialDuplicates?.length ?? 0} complaints may describe the same issue.` : 'No strong match found'} />
                <p className="text-sm text-grace-text"><strong>Recommendation:</strong> {analysis.recommendation}</p>
              </div>
            )}
            {!analysis && !analyzing && (
              <button type="button" onClick={runAnalysis} className="btn-primary w-full gap-2">
                <Brain className="h-5 w-5" aria-hidden="true" /> Analyze Complaint
              </button>
            )}
            <NavButtons
              onBack={() => setStep(1)}
              onNext={() => { if (analysis) setStep(3); else runAnalysis(); }}
              nextLabel={analysis ? 'Review & Submit' : 'Analyze first'}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="card space-y-3">
              <h2 className="text-lg font-semibold">Review your complaint</h2>
              <ReviewRow label="Title" value={form.title} />
              <ReviewRow label="Description" value={form.description} />
              <ReviewRow label="Location" value={form.location} />
              <ReviewRow label="Area" value={wards.find((w) => w._id === form.wardId)?.name ?? '—'} />
              <ReviewRow label="Category" value={categories.find((c) => c._id === form.categoryId)?.name ?? '—'} />
            </div>

            {analysis && (
              <div className="card border-grace-sandal/30">
                <p className="font-medium text-grace-text">Does this look correct?</p>
                <p className="mt-1 text-sm text-grace-muted">Department: {friendlyDepartment(analysis.department)} · Priority: {friendlyPriority(analysis.priority)}</p>
              </div>
            )}

            <div className="sticky bottom-20 flex gap-3 lg:bottom-0">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">Edit Details</button>
              <button type="submit" disabled={submitting || !analysis} className="btn-primary flex-1">
                {submitting ? 'Submitting...' : 'Yes, Submit Complaint'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Step ${current + 1} of ${STEPS.length}`}>
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center gap-1">
          <div className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
            i <= current ? 'bg-civic-primary text-white' : 'bg-civic-border text-civic-muted'
          )}>{i + 1}</div>
          <span className={cn('hidden text-xs sm:inline', i <= current ? 'font-medium text-civic-text' : 'text-civic-muted')}>{label}</span>
          {i < STEPS.length - 1 && <div className={cn('h-0.5 flex-1', i < current ? 'bg-civic-primary' : 'bg-civic-border')} />}
        </div>
      ))}
    </div>
  );
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-base font-medium text-civic-text">{label}{required && ' *'}</label>
      {children}
      {error && <p className="mt-1 text-sm text-civic-critical" role="alert">{error}</p>}
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel }: { onBack: (() => void) | null; onNext: () => void; nextLabel: string }) {
  return (
    <div className="flex gap-3 pt-2">
      {onBack && <button type="button" onClick={onBack} className="btn-secondary flex-1 gap-1"><ChevronLeft className="h-4 w-4" /> Back</button>}
      <button type="button" onClick={onNext} className="btn-primary flex-1 gap-1">{nextLabel} <ChevronRight className="h-4 w-4" /></button>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-civic-border pb-2 last:border-0">
      <p className="text-xs text-civic-muted">{label}</p>
      <p className="text-sm font-medium text-civic-text">{value}</p>
    </div>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-civic-muted">{label}</p>
      <p className="text-sm font-medium text-civic-text">{value}</p>
    </div>
  );
}
