import { useState, useEffect, useCallback } from 'react';
import { getJobs, Job } from '@/services/jobService';
import { useAuth } from '@/context/AuthContext';

export function useJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getJobs(user.uid);
      setJobs(data);
    } catch (e) {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, refetch: fetchJobs };
}
