// Turns the filter state into a query string, e.g. ?search=sec&category=Design&category=Security&page=2
export const toQuery = (f) => {
  const q = new URLSearchParams();
  if (f.search) q.set('search', f.search);
  f.category.forEach((c) => q.append('category', c));
  f.level.forEach((l) => q.append('level', l));
  if (f.minRating > 0) q.set('minRating', f.minRating);
  if (f.sort !== 'relevance') q.set('sort', f.sort);
  if (f.page > 1) q.set('page', f.page);
  if (f.limit !== 12) q.set('limit', f.limit);
  return q.toString();
};

const json = (r) => {
  if (!r.ok) throw new Error(`The server answered with an error (${r.status}).`);
  return r.json();
};

export const fetchResources = (query, signal) => fetch(`/api/resources?${query}`, { signal }).then(json);
export const fetchMeta = () => fetch('/api/meta').then(json);
