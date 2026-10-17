'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ActivityContext = createContext(null);

export async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers: { ...(options.body && { 'Content-Type': 'application/json' }), ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || 'No fue posible completar la solicitud.');
    error.fields = body.fields;
    error.status = response.status;
    throw error;
  }
  return body;
}

export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState(null);
  const [toast, setToast] = useState(null);
  const latestRequest = useRef(0);
  const toastTimer = useRef(null);
  const notify = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }, []);

  const refresh = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError('');
    try {
      const { data } = await apiRequest('/api/actividades');
      if (requestId === latestRequest.current) {
        setActivities(data);
        setLastSync(new Date());
      }
    } catch (e) {
      if (requestId === latestRequest.current)
        setError(e.message || 'No pudimos cargar las actividades.');
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    return () => {
      latestRequest.current += 1;
      clearTimeout(toastTimer.current);
    };
  }, [refresh]);

  async function saveActivity(values, id) {
    const { data } = await apiRequest(id ? `/api/actividades/${id}` : '/api/actividades', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(values),
    });
    // Invalida una consulta anterior para que no sobrescriba el cambio recién guardado.
    latestRequest.current += 1;
    setLoading(false);
    setError('');
    setActivities((current) =>
      id ? current.map((a) => (a.id === id ? data : a)) : [...current, data],
    );
    setLastSync(new Date());
    notify(id ? 'Los cambios se guardaron correctamente.' : 'Actividad registrada correctamente.');
    return data;
  }

  async function deleteActivity(id) {
    await apiRequest(`/api/actividades/${id}`, { method: 'DELETE' });
    latestRequest.current += 1;
    setLoading(false);
    setError('');
    setActivities((current) => current.filter((a) => a.id !== id));
    setLastSync(new Date());
    notify('La actividad se eliminó correctamente.');
  }

  return (
    <ActivityContext.Provider
      value={{
        activities,
        loading,
        error,
        lastSync,
        toast,
        setToast,
        refresh,
        saveActivity,
        deleteActivity,
        notify,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivities() {
  const value = useContext(ActivityContext);
  if (!value) throw new Error('Falta ActivityProvider.');
  return value;
}
