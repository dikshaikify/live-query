// Pure search/filter logic (no Express), so it is easy to unit test.
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 12;
const SORTS = ['relevance', 'rating', 'shortest', 'longest'];

const list = (v) => [].concat(v ?? []).flatMap((x) => String(x).split(',')).map((s) => s.trim()).filter(Boolean);
const toInt = (v, d, min, max) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};

function parseParams(q = {}) {
  return {
    search: String(q.search ?? '').trim().slice(0, 100),
    category: list(q.category),
    level: list(q.level),
    minRating: Math.min(5, Math.max(0, parseFloat(q.minRating) || 0)),
    sort: SORTS.includes(q.sort) ? q.sort : 'relevance',
    page: toInt(q.page, 1, 1, 1e6),
    limit: toInt(q.limit, DEFAULT_LIMIT, 1, MAX_LIMIT),
  };
}

const inList = (arr, value) => arr.some((x) => x.toLowerCase() === value.toLowerCase());
const tokens = (s) => s.toLowerCase().split(/\s+/).filter(Boolean);

// `skip` leaves one filter out, which is how facet counts stay useful (see searchCatalog).
function matches(item, p, skip) {
  if (skip !== 'category' && p.category.length && !inList(p.category, item.category)) return false;
  if (skip !== 'level' && p.level.length && !inList(p.level, item.level)) return false;
  if (item.rating < p.minRating) return false;
  if (p.search) {
    const hay = `${item.title} ${item.category} ${item.level}`.toLowerCase();
    if (!tokens(p.search).every((t) => hay.includes(t))) return false;
  }
  return true;
}

const score = (item, search) => {
  const title = item.title.toLowerCase();
  return tokens(search).reduce((s, t) => s + (title.includes(t) ? 2 : 1), 0);
};

const countBy = (items, key) => items.reduce((o, i) => ((o[i[key]] = (o[i[key]] || 0) + 1), o), {});

function searchCatalog(items, query) {
  const p = parseParams(query);
  const found = items.filter((i) => matches(i, p));

  const by = {
    rating: (a, b) => b.rating - a.rating || a.id - b.id,
    shortest: (a, b) => a.durationMinutes - b.durationMinutes || a.id - b.id,
    longest: (a, b) => b.durationMinutes - a.durationMinutes || a.id - b.id,
    relevance: (a, b) => (p.search ? score(b, p.search) - score(a, p.search) : 0) || b.rating - a.rating || a.id - b.id,
  }[p.sort];
  found.sort(by);

  const total = found.length;
  const totalPages = Math.max(1, Math.ceil(total / p.limit));
  const page = Math.min(p.page, totalPages);
  return {
    data: found.slice((page - 1) * p.limit, page * p.limit),
    meta: { total, page, limit: p.limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    // Each facet ignores its own filter, so ticking "Security" still shows counts for other categories.
    facets: {
      category: countBy(items.filter((i) => matches(i, p, 'category')), 'category'),
      level: countBy(items.filter((i) => matches(i, p, 'level')), 'level'),
    },
  };
}

module.exports = { searchCatalog, parseParams, MAX_LIMIT };
