import { useCallback, useEffect, useState } from 'react';
import { getPublicGovernanceStats, type PublicGovernanceStats } from '@/services/analyticsService';

const DEFAULT_INTERVAL_MS = 60_000;

interface UseLiveGovernanceStatsOptions {
  refreshIntervalMs?: number;
  enabled?: boolean;
}

export function useLiveGovernanceStats(options: UseLiveGovernanceStatsOptions = {}) {
  const { refreshIntervalMs = DEFAULT_INTERVAL_MS, enabled = true } = options;
  const [stats, setStats] = useState<PublicGovernanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setError(null);
    try {
      const data = await getPublicGovernanceStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    refetch();
    const interval = setInterval(refetch, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [enabled, refetch, refreshIntervalMs]);

  return { stats, loading, error, lastUpdated, refetch };
}
