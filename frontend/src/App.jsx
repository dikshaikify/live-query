import { useEffect, useMemo, useState } from 'react';
import { fetchMeta, toQuery } from './api.js';
import { useDebounce, useResources } from './hooks.js';
import Filters from './components/Filters.jsx';
import ResultGrid from './components/ResultGrid.jsx';
import Pagination from './components/Pagination.jsx';

const DEFAULTS = { search: '', category: [], level: [], minRating: 0, sort: 'relevance', page: 1, limit: 12 };

// Filters live in the URL, so a filtered view can be shared or refreshed.
const fromUrl = () => {
  const q = new URLSearchParams(window.location.search);
  return {
    search: q.get('search') || '',
    category: q.getAll('category'),
    level: q.getAll('level'),
    minRating: Number(q.get('minRating')) || 0,
    sort: q.get('sort') || 'relevance',
    page: Number(q.get('page')) || 1,
    limit: Number(q.get('limit')) || 12,
  };
};

export default function App() {
  const [f, setF] = useState(fromUrl);
  const [meta, setMeta] = useState({ categories: [], levels: [] });
  const debouncedSearch = useDebounce(f.search, 400);
  const params = useMemo(() => ({ ...f, search: debouncedSearch }), [f, debouncedSearch]);
  const { data, loading, error, calls, retry } = useResources(params);

  useEffect(() => { fetchMeta().then(setMeta).catch(() => {}); }, []);
  useEffect(() => { window.history.replaceState(null, '', `?${toQuery(f)}`); }, [f]);

  const update = (patch) => setF((cur) => ({ ...cur, page: 1, ...patch })); // any filter change returns to page 1
  const toggle = (key, value) =>
    update({ [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value] });
  const goTo = (page) => { setF((cur) => ({ ...cur, page })); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => setF({ ...DEFAULTS, limit: f.limit });

  const m = data?.meta;
  const from = m && m.total ? (m.page - 1) * m.limit + 1 : 0;
  const to = m ? Math.min(m.page * m.limit, m.total) : 0;
  const typing = f.search !== debouncedSearch;

  const chips = [
    ...(f.search ? [{ k: 'q', label: `“${f.search}”`, off: () => update({ search: '' }) }] : []),
    ...f.category.map((c) => ({ k: `c${c}`, label: c, off: () => toggle('category', c) })),
    ...f.level.map((l) => ({ k: `l${l}`, label: l, off: () => toggle('level', l) })),
    ...(f.minRating ? [{ k: 'r', label: `${f.minRating}+ stars`, off: () => update({ minRating: 0 }) }] : []),
  ];

  return (
    <main>
      <header>
        <h1>Learning catalog</h1>
        <div className="searchbar">
          <input
            type="search"
            value={f.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search by title, category or level"
            aria-label="Search resources"
          />
          <span className="hint" aria-live="polite">{typing ? 'Waiting for you to stop typing…' : loading ? 'Searching…' : ' '}</span>
        </div>
        <p className="calls" title="Requests are sent only after you pause typing">API calls made: <b>{calls}</b></p>
      </header>

      <div className="layout">
        <Filters f={f} meta={meta} facets={data?.facets} onToggle={toggle} onChange={update} onReset={reset} />
        <section>
          <div className="toolbar">
            <p aria-live="polite">{m ? (m.total ? `Showing ${from}–${to} of ${m.total} resources` : '0 resources') : 'Loading…'}</p>
            <label>
              Sort by{' '}
              <select value={f.sort} onChange={(e) => update({ sort: e.target.value })}>
                <option value="relevance">Best match</option>
                <option value="rating">Highest rated</option>
                <option value="shortest">Shortest first</option>
                <option value="longest">Longest first</option>
              </select>
            </label>
          </div>
          {chips.length > 0 && (
            <div className="chips">
              {chips.map((c) => <button key={c.k} className="chip" onClick={c.off} aria-label={`Remove ${c.label}`}>{c.label} ×</button>)}
            </div>
          )}
          <div className={`bar ${loading ? 'on' : ''}`} aria-hidden="true" />
          <ResultGrid data={data} loading={loading} error={error} limit={f.limit} onRetry={retry} onClear={reset} />
          <Pagination meta={m} limit={f.limit} onPage={goTo} onLimit={(limit) => update({ limit })} />
        </section>
      </div>
    </main>
  );
}
