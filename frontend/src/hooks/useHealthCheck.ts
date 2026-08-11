import { useEffect, useState } from 'react';
import { checkHealth } from '@/services/api';
import type { HealthData } from '@/types';

interface UseHealthCheckResult {
  health: HealthData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHealthCheck(): UseHealthCheckResult {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to backend');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return { health, loading, error, refetch: fetchHealth };
}
