import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Download, RefreshCw } from 'lucide-react';
import {
  getAnalyticsOverview,
  getAnalyticsTrends,
  getDepartmentAnalytics,
  getCategoryAnalytics,
  getSlaAnalytics,
  getHotspotAnalytics,
  getForecastAnalytics,
  getRootCauseAnalytics,
  getAIRecommendations,
  getPolicyImpactAnalytics,
  getDateRangeFromPreset,
  exportCsv,
} from '@/services/analyticsService';
import { getCategories, getWards } from '@/services/grievanceService';
import type {
  AnalyticsOverview,
  TrendsData,
  DepartmentAnalyticsResponse,
  CategoryAnalyticsResponse,
  SLAAnalytics,
  HotspotAnalytics,
  ForecastData,
  RootCauseInsight,
  AIRecommendationItem,
  PolicyImpactItem,
  AnalyticsFilters,
} from '@/types/analytics';
import type { Category, Ward } from '@/types/grievance';
import {
  AnalyticsSkeleton,
  RecommendationSkeleton,
  HotspotSkeleton,
} from '@/components/skeletons/Skeletons';

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#10b981',
  MEDIUM: '#0ea5e9',
  HIGH: '#f59e0b',
  CRITICAL: '#ef4444',
};

const SECTIONS = [
  'Overview',
  'Trends',
  'Departments',
  'Categories',
  'SLA',
  'Hotspots',
  'Root Causes',
  'Forecast',
  'Recommendations',
  'Policy Impact',
] as const;

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<string>('Overview');
  const [datePreset, setDatePreset] = useState('all');
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<HotspotAnalytics | null>(null);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [departments, setDepartments] = useState<DepartmentAnalyticsResponse | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryAnalyticsResponse | null>(null);
  const [sla, setSla] = useState<SLAAnalytics | null>(null);
  const [hotspots, setHotspots] = useState<HotspotAnalytics[]>([]);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [rootCauses, setRootCauses] = useState<RootCauseInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendationItem[]>([]);
  const [policies, setPolicies] = useState<PolicyImpactItem[]>([]);

  useEffect(() => {
    Promise.all([getCategories(), getWards()]).then(([c, w]) => {
      setCategories(c);
      setWards(w);
    });
  }, []);

  const apiFilters = useMemo(() => {
    const range = datePreset === 'custom' ? {} : getDateRangeFromPreset(datePreset);
    return { ...range, ...filters };
  }, [datePreset, filters]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [
        ov,
        tr,
        dept,
        cat,
        slaData,
        hot,
        fc,
        rc,
        rec,
        pol,
      ] = await Promise.all([
        getAnalyticsOverview(apiFilters),
        getAnalyticsTrends(apiFilters),
        getDepartmentAnalytics(apiFilters),
        getCategoryAnalytics(apiFilters),
        getSlaAnalytics(apiFilters),
        getHotspotAnalytics(apiFilters),
        getForecastAnalytics(apiFilters),
        getRootCauseAnalytics(apiFilters),
        getAIRecommendations(apiFilters),
        getPolicyImpactAnalytics(),
      ]);
      setOverview(ov);
      setTrends(tr);
      setDepartments(dept);
      setCategoryData(cat);
      setSla(slaData);
      setHotspots(hot);
      setForecast(fc);
      setRootCauses(rc);
      setRecommendations(rec);
      setPolicies(pol);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [apiFilters]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const forecastChartData = useMemo(() => {
    if (!forecast) return [];
    const historical = forecast.historical.map((h) => ({
      period: h.period,
      actual: h.count,
      predicted: undefined as number | undefined,
    }));
    const predicted = forecast.forecast.map((f) => ({
      period: f.period,
      actual: undefined as number | undefined,
      predicted: f.predicted,
    }));
    return [...historical, ...predicted];
  }, [forecast]);

  const handleExportDepartments = () => {
    if (!departments) return;
    exportCsv(
      'department-analytics.csv',
      ['Department', 'Total', 'Resolved', 'In Progress', 'SLA %', 'Avg Resolution Days'],
      departments.departments.map((d) => [
        d.departmentName,
        String(d.totalComplaints),
        String(d.resolved),
        String(d.inProgress),
        String(d.slaCompliance),
        String(d.averageResolutionTime),
      ])
    );
  };

  if (loading && !overview) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Analytics Intelligence</h1>
          <p className="mt-1 text-sm text-navy-500">
            MongoDB aggregation · Rule-Based AI Demo · Prototype Forecast
          </p>
        </div>
        <button onClick={loadAll} className="btn-secondary inline-flex items-center gap-2 text-sm">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="card flex flex-wrap gap-3">
        <select
          value={datePreset}
          onChange={(e) => setDatePreset(e.target.value)}
          className="input-field max-w-[160px]"
        >
          <option value="all">All Time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="year">This Year</option>
        </select>
        <select
          value={filters.department ?? ''}
          onChange={(e) => setFilters({ ...filters, department: e.target.value || undefined })}
          className="input-field max-w-[180px]"
        >
          <option value="">All Departments</option>
          {[...new Map(categories.map((c) => [c.defaultDepartmentId._id, c.defaultDepartmentId])).values()].map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
        <select
          value={filters.category ?? ''}
          onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
          className="input-field max-w-[180px]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filters.ward ?? ''}
          onChange={(e) => setFilters({ ...filters, ward: e.target.value || undefined })}
          className="input-field max-w-[160px]"
        >
          <option value="">All Wards</option>
          {wards.map((w) => (
            <option key={w._id} value={w._id}>{w.name}</option>
          ))}
        </select>
        <select
          value={filters.priority ?? ''}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined })}
          className="input-field max-w-[140px]"
        >
          <option value="">All Priorities</option>
          {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeSection === s
                ? 'bg-grace-cyan text-white'
                : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      )}

      {(activeSection === 'Overview' || activeSection === 'Trends') && overview && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Grievances', value: overview.totalGrievances },
            { label: 'In Progress', value: overview.inProgress },
            { label: 'Resolved', value: overview.resolved + overview.closed },
            { label: 'SLA Compliance', value: `${overview.slaCompliance}%` },
            { label: 'SLA At Risk', value: overview.slaAtRisk },
            { label: 'Escalated', value: overview.escalated },
            { label: 'Avg Resolution (days)', value: overview.averageResolutionDays },
            { label: 'Duplicates', value: overview.duplicateCount },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-navy-100 bg-white p-4 shadow-card">
              <p className="text-xs font-medium text-navy-500">{kpi.label}</p>
              <p className="mt-2 text-2xl font-bold text-navy-900">{kpi.value}</p>
            </div>
          ))}
        </section>
      )}

      {(activeSection === 'Overview' || activeSection === 'Trends') && (
        <section className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Complaint Trend" subtitle="Database-derived monthly counts">
            {!trends?.trends.length ? (
              <EmptyChart message="No grievance data available for this period." />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trends.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v} complaints`, 'Count']} />
                  <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Priority Distribution" subtitle="From MongoDB grievance records">
            {!categoryData?.priorityDistribution.length ? (
              <EmptyChart message="No priority data available." />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData.priorityDistribution}
                    dataKey="count"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ priority, count }) => `${priority}: ${count}`}
                  >
                    {categoryData.priorityDistribution.map((entry) => (
                      <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [`${v}`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </section>
      )}

      {(activeSection === 'Overview' || activeSection === 'Departments') && departments && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy-900">Department Performance</h2>
            <button onClick={handleExportDepartments} className="text-xs text-grace-cyan hover:underline inline-flex items-center gap-1">
              <Download className="h-3 w-3" /> Export CSV
            </button>
          </div>
          {!departments.departments.length ? (
            <EmptyChart message="No department data available." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departments.departments.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="departmentName" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalComplaints" fill="#0ea5e9" name="Total" />
                  <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                  <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {departments.rankings.highestVolume && (
                  <RankCard label="Highest Volume" value={departments.rankings.highestVolume.departmentName} sub={`${departments.rankings.highestVolume.totalComplaints} complaints`} />
                )}
                {departments.rankings.bestSla && (
                  <RankCard label="Best SLA" value={departments.rankings.bestSla.departmentName} sub={`${departments.rankings.bestSla.slaCompliance}% compliance`} />
                )}
                {departments.rankings.longestResolution && (
                  <RankCard label="Longest Resolution" value={departments.rankings.longestResolution.departmentName} sub={`${departments.rankings.longestResolution.averageResolutionTime} days avg`} />
                )}
                {departments.rankings.highestUnresolved && (
                  <RankCard label="Highest Unresolved" value={departments.rankings.highestUnresolved.departmentName} sub={`${departments.rankings.highestUnresolved.unresolved} open`} />
                )}
              </div>
            </>
          )}
        </section>
      )}

      {(activeSection === 'Overview' || activeSection === 'Categories') && categoryData && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-navy-900">Category Distribution</h2>
          {!categoryData.categories.length ? (
            <EmptyChart message="No category data available." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData.categories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="categoryName" width={120} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number, name: string, props) => {
                  if (name === 'complaintCount') return [`${v} (${props.payload.percentage}%)`, 'Complaints'];
                  return [v, name];
                }} />
                <Bar dataKey="complaintCount" fill="#6366f1" name="Complaints" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>
      )}

      {(activeSection === 'Overview' || activeSection === 'SLA') && sla && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'SLA Predictions', value: sla.total },
            { label: 'Critical Risk', value: sla.critical, color: 'text-red-600' },
            { label: 'High Risk', value: sla.high, color: 'text-orange-600' },
            { label: 'Overdue', value: sla.overdue, color: 'text-red-700' },
            { label: 'Compliant', value: sla.compliant },
            { label: 'Compliance %', value: `${sla.compliancePercentage}%` },
            { label: 'Low Risk', value: sla.low, color: 'text-emerald-600' },
            { label: 'Medium Risk', value: sla.medium, color: 'text-amber-600' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-navy-100 bg-white p-4">
              <p className="text-xs text-navy-500">{item.label}</p>
              <p className={`mt-1 text-2xl font-bold ${item.color ?? 'text-navy-900'}`}>{item.value}</p>
            </div>
          ))}
        </section>
      )}

      {(activeSection === 'Overview' || activeSection === 'Hotspots') && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-navy-900">Regional Hotspots</h2>
          {loading && !hotspots.length ? (
            <HotspotSkeleton />
          ) : !hotspots.length ? (
            <EmptyChart message="No ward hotspot data available." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hotspots.map((w) => (
                <button
                  key={w.wardId}
                  onClick={() => setSelectedWard(w)}
                  className={`rounded-xl border p-4 text-left transition-shadow hover:shadow-card ${
                    w.intensity === 'HIGH'
                      ? 'border-red-200 bg-red-50'
                      : w.intensity === 'MEDIUM'
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-emerald-200 bg-emerald-50'
                  }`}
                >
                  <p className="font-semibold text-navy-900">{w.wardName}</p>
                  <p className="text-2xl font-bold text-navy-900">{w.complaintCount}</p>
                  <p className="text-xs text-navy-600">complaints · {w.activityLabel}</p>
                  <p className="mt-1 text-xs text-navy-500">Top: {w.topCategory}</p>
                </button>
              ))}
            </div>
          )}
          {selectedWard && (
            <div className="mt-4 rounded-xl border border-grace-cyan/30 bg-white p-5">
              <h3 className="font-semibold text-navy-900">{selectedWard.wardName} Detail</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
                <Detail label="Complaint Count" value={selectedWard.complaintCount} />
                <Detail label="Top Category" value={selectedWard.topCategory} />
                <Detail label="Avg Resolution (days)" value={selectedWard.averageResolutionTime} />
                <Detail label="SLA Compliance" value={`${selectedWard.slaCompliance}%`} />
                <Detail label="High Priority" value={selectedWard.highPriorityCount} />
              </div>
            </div>
          )}
        </section>
      )}

      {(activeSection === 'Overview' || activeSection === 'Root Causes') && (
        <section>
          <h2 className="mb-2 text-lg font-semibold text-navy-900">Root Cause Intelligence</h2>
          <p className="mb-4 text-xs text-grace-cyan">Rule-Based AI Insight · AI-Generated Demo Insight</p>
          {!rootCauses.length ? (
            <EmptyChart message="No significant category-ward patterns detected." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {rootCauses.slice(0, 6).map((rc) => (
                <div key={`${rc.categoryId}-${rc.wardId}`} className="rounded-xl border border-navy-100 bg-white p-5">
                  <p className="text-xs font-medium text-grace-cyan">{rc.insightLabel}</p>
                  <h3 className="mt-1 font-semibold text-navy-900">Recurring: {rc.categoryName}</h3>
                  <p className="text-sm text-navy-600">Affected Region: {rc.wardName}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-navy-500">Volume</span><p className="font-bold">{rc.complaintCount}</p></div>
                    <div><span className="text-navy-500">Trend</span><p className="font-bold">{rc.trend}</p></div>
                    <div><span className="text-navy-500">SLA</span><p className="font-bold">{rc.slaCompliance}%</p></div>
                  </div>
                  <p className="mt-3 text-sm"><strong>Possible Root Cause:</strong> {rc.possibleRootCause}</p>
                  <p className="mt-1 text-sm text-navy-600"><strong>Recommendation:</strong> {rc.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(activeSection === 'Overview' || activeSection === 'Forecast') && (
        <section>
          <h2 className="mb-2 text-lg font-semibold text-navy-900">Prototype Forecast</h2>
          <p className="mb-4 text-xs text-navy-500">
            Method: {forecast?.method ?? 'MOVING_AVERAGE_DEMO'} · Prototype Forecast
          </p>
          {!forecast?.historical.length ? (
            <EmptyChart message="Insufficient historical data for reliable prototype forecast." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="actual" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} name="Historical" />
                <Area type="monotone" dataKey="predicted" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} name="Forecast" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </section>
      )}

      {(activeSection === 'Overview' || activeSection === 'Recommendations') && (
        <section>
          <h2 className="mb-2 text-lg font-semibold text-navy-900">AI Governance Recommendations</h2>
          <p className="mb-4 text-xs text-grace-cyan">AI-Generated Demo Recommendation</p>
          {loading && !recommendations.length ? (
            <RecommendationSkeleton />
          ) : !recommendations.length ? (
            <EmptyChart message="No recommendations generated yet." />
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec._id} className="rounded-xl border border-navy-100 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold text-navy-900">{rec.title}</h3>
                    <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs font-medium">{rec.priority}</span>
                  </div>
                  <p className="mt-1 text-xs text-grace-cyan">{rec.insightLabel}</p>
                  {rec.evidence && <p className="mt-2 text-sm text-navy-600"><strong>Evidence:</strong> {rec.evidence}</p>}
                  <p className="mt-2 text-sm text-navy-700">{rec.recommendation}</p>
                  <p className="mt-2 text-xs text-navy-400">
                    {rec.wardId ? `${rec.wardId.name} · ` : ''}
                    {rec.categoryId?.name ?? ''} · {new Date(rec.generatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(activeSection === 'Overview' || activeSection === 'Policy Impact') && (
        <section>
          <h2 className="mb-2 text-lg font-semibold text-navy-900">Policy Impact Analysis</h2>
          <p className="mb-4 text-xs text-navy-500">Seeded Policy Example · from MongoDB PolicyImpact records</p>
          {!policies.length ? (
            <EmptyChart message="No policy impact records available." />
          ) : (
            <div className="space-y-4">
              {policies.map((p) => (
                <div key={p._id} className="rounded-xl border border-navy-100 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold text-navy-900">{p.policyName}</h3>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{p.label}</span>
                  </div>
                  <p className="mt-1 text-sm text-navy-600">{p.description}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                    <div>
                      <p className="text-xs text-navy-500">Complaints / month</p>
                      <p className="font-bold">{p.beforeComplaintsPerMonth} → {p.afterComplaintsPerMonth}</p>
                      <p className={`text-xs ${p.complaintChangePercent < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {p.complaintChangePercent > 0 ? '+' : ''}{p.complaintChangePercent}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-500">SLA Compliance</p>
                      <p className="font-bold">{p.slaBefore}% → {p.slaAfter}%</p>
                      <p className="text-xs text-emerald-600">+{p.slaImprovementPercent}% improvement</p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-500">Department</p>
                      <p className="font-medium">{p.department.name}</p>
                      {p.category && <p className="text-xs text-navy-500">{p.category.name}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-5">
      <h3 className="font-semibold text-navy-900">{title}</h3>
      <p className="mb-4 text-xs text-navy-500">{subtitle}</p>
      {children}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-navy-200 bg-navy-50/50 text-sm text-navy-500">
      {message}
    </div>
  );
}

function RankCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-navy-100 bg-navy-50/50 p-3">
      <p className="text-xs text-navy-500">{label}</p>
      <p className="font-semibold text-navy-900">{value}</p>
      <p className="text-xs text-navy-600">{sub}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-navy-500">{label}</p>
      <p className="font-medium text-navy-900">{value}</p>
    </div>
  );
}
