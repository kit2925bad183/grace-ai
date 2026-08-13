import { useState } from 'react';
import { Star } from 'lucide-react';
import { submitGrievanceFeedback } from '@/services/grievanceService';
import { cn } from '@/utils/cn';

interface GrievanceFeedbackFormProps {
  grievanceId: string;
  existingRating?: number | null;
  existingComment?: string | null;
  onSubmitted?: () => void;
}

export function GrievanceFeedbackForm({
  grievanceId,
  existingRating,
  existingComment,
  onSubmitted,
}: GrievanceFeedbackFormProps) {
  const [rating, setRating] = useState(existingRating ?? 0);
  const [comment, setComment] = useState(existingComment ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(Boolean(existingRating));

  if (success && existingRating) {
    return (
      <div className="card border-civic-success/30 bg-green-50/50">
        <h2 className="text-lg font-semibold text-civic-text">Your feedback</h2>
        <div className="mt-2 flex gap-1" aria-label={`Rating: ${existingRating} out of 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={cn('h-5 w-5', n <= existingRating ? 'fill-amber-400 text-amber-400' : 'text-civic-border')}
              aria-hidden="true"
            />
          ))}
        </div>
        {existingComment && <p className="mt-3 text-sm text-civic-muted">{existingComment}</p>}
        <p className="mt-2 text-xs text-civic-success">Thank you for your feedback.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError('Please select a rating.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitGrievanceFeedback(grievanceId, { rating, comment: comment.trim() || undefined });
      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="text-lg font-semibold text-civic-text">Rate your resolution</h2>
      <p className="mt-1 text-sm text-civic-muted">
        Help us improve GRACE AI by sharing your experience.
      </p>
      <div className="mt-4 flex gap-2" role="group" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className="rounded-lg p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-civic-primary"
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            aria-pressed={rating >= n}
          >
            <Star
              className={cn('h-8 w-8', n <= rating ? 'fill-amber-400 text-amber-400' : 'text-civic-border')}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm font-medium text-civic-text" htmlFor="feedback-comment">
        Comments (optional)
      </label>
      <textarea
        id="feedback-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
        className="input-field mt-1 w-full resize-none"
        placeholder="Tell us about your experience..."
      />
      {error && <p className="mt-2 text-sm text-civic-critical">{error}</p>}
      {success && <p className="mt-2 text-sm text-civic-success">Thank you for your feedback!</p>}
      <button type="submit" disabled={submitting} className="btn-primary mt-4">
        {submitting ? 'Submitting…' : 'Submit Feedback'}
      </button>
    </form>
  );
}
