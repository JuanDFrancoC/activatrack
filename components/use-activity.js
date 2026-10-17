'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from './activity-context';

export function useActivity(id) {
  const [state, setState] = useState({
    activity: null,
    loading: Boolean(id),
    error: '',
    status: null,
  });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setState({ activity: null, loading: true, error: '', status: null });
    apiRequest(`/api/actividades/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(({ data }) => setState({ activity: data, loading: false, error: '', status: 200 }))
      .catch((e) => {
        if (e.name !== 'AbortError')
          setState({ activity: null, loading: false, error: e.message, status: e.status });
      });
    return () => controller.abort();
  }, [id, attempt]);
  return { ...state, retry: () => setAttempt((n) => n + 1) };
}
