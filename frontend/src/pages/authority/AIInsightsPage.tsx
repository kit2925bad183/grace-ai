import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import {
  getRootCauseAnalytics,
  getAIRecommendations,
  getPolicyImpactAnalytics,
} from '@/services/analyticsService';
import type { RootCauseInsight, AIRecommendationItem, PolicyImpactItem } from '@/types/analytics';
import { RecommendationSkeleton, ChartSkeleton } from '@/components/skeletons/Skeletons';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { usePortalPaths } from '@/utils/portalPaths';

export default function AIInsightsPage() {
  const paths = usePortalPaths();
  const [rootCauses, setRootCauses] = useState<RootCauseInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendationItem[]>([]);
  const [policies, setPolicies] = useState<PolicyImpactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.allSettled([
      getRootCauseAnalytics(),
      getAIRecommendations(),
      getPolicyImpactAnalytics(),
    ]).then(([rc, rec, pol]) => {
      if (rc.status === 'fulfilled') setRootCauses(rc.value);
      if (rec.status === 'fulfilled') setRecommendations(rec.value);
      if (pol.status === 'fulfilled') setPolicies(pol.value);
      const failed = [rc, rec, pol].find((r) => r.status === 'rejected');
      if (failed?.status === 'rejected') {
        setError(failed.reason instanceof Error ? failed.reason.message : 'Failed to load insights');
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <RecommendationSkeleton />;
  if (error) return <ErrorState title="Unable to load AI insights" message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-10 animate-fade-in">
      <PageHeader
        title="AI Insights"
        subtitle="Root cause intelligence, governance recommendations, and policy impact — powered by backend analytics."
        actions={
          <Link to={paths.analytics} className="btn-secondary text-sm">
            Analytics Dashboard
          </Link>
        }
      />

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-grace-cyan" />
          <h2 className="text-lg font-semibold text-navy-900">Root Cause Intelligence</h2>
        </div>
        {rootCauses.length === 0 ? (
          <div className="card text-sm text-navy-500">No significant patterns detected yet.</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {rootCauses.slice(0, 6).map((rc) => (
              <div key={`${rc.categoryId}-${rc.wardId}`} className="card">
                <p className="text-xs font-medium text-grace-cyan">{rc.insightLabel}</p>
                <h3 className="mt-1 font-semibold text-navy-900">{rc.categoryName} · {rc.wardName}</h3>
                <div className="mt-3 flex gap-4 text-xs">
                  <span><strong>{rc.complaintCount}</strong> complaints</span>
                  <span>Trend: <strong>{rc.trend}</strong></span>
                  <span>SLA: <strong>{rc.slaCompliance}%</strong></span>
                </div>
                <p className="mt-3 text-sm text-navy-700"><strong>Root cause:</strong> {rc.possibleRootCause}</p>
                <p className="mt-1 text-sm text-navy-600">{rc.recommendation}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-navy-900">AI Governance Recommendations</h2>
        {recommendations.length === 0 ? (
          <div className="card text-sm text-navy-500">No recommendations generated yet.</div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec._id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold text-navy-900">{rec.title}</h3>
                  <span className="badge bg-navy-100 text-navy-700">{rec.priority}</span>
                </div>
                <p className="mt-1 text-xs text-grace-cyan">{rec.insightLabel}</p>
                {rec.evidence && <p className="mt-2 text-sm text-navy-600">{rec.evidence}</p>}
                <p className="mt-2 text-sm text-navy-700">{rec.recommendation}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-navy-900">Policy Impact</h2>
        {policies.length === 0 ? (
          <ChartSkeleton />
        ) : (
          <div className="space-y-4">
            {policies.map((p) => (
              <div key={p._id} className="card">
                <h3 className="font-semibold text-navy-900">{p.policyName}</h3>
                <p className="mt-1 text-sm text-navy-600">{p.description}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
                  <div><span className="text-navy-500">Impact</span><p className="font-bold">{p.impactPercentage}%</p></div>
                  <div><span className="text-navy-500">Complaint Change</span><p className="font-bold">{p.complaintChangePercent}%</p></div>
                  <div><span className="text-navy-500">SLA Improvement</span><p className="font-bold">{p.slaImprovementPercent}%</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
