import { useEffect, useState } from 'react';
import { fetchResources, toQuery } from './api.js';

// Returns `value` only after it has stopped changing for `ms` milliseconds.
export function useDebounce(value, ms = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

// Fetches whenever params change. The previous request is aborted, so a slow old
// response can never overwrite a newer one. Old data stays on screen while loading.
export function useResources(params) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [calls, setCalls] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const query = toQuery(params);

  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: '' }));
    setCalls((c) => c + 1);
    fetchResources(query, ctrl.signal)
      .then((data) => setState({ data, loading: false, error: '' }))
      .catch((e) => {
        if (e.name !== 'AbortError') setState((s) => ({ ...s, loading: false, error: e.message }));
      });
    return () => ctrl.abort();
  }, [query, attempt]);

  return { ...state, calls, retry: () => setAttempt((a) => a + 1) };
}
