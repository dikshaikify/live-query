const test = require('node:test');
const assert = require('node:assert');
const catalog = require('./data/catalog.json');
const { searchCatalog } = require('./search');

test('returns first page with metadata', () => {
  const r = searchCatalog(catalog, {});
  assert.equal(r.data.length, 12);
  assert.equal(r.meta.total, 250);
  assert.equal(r.meta.totalPages, 21);
  assert.equal(r.meta.hasPrev, false);
});

test('multi-category filter matches any selected category', () => {
  const r = searchCatalog(catalog, { category: ['Design', 'Analytics'], limit: 50 });
  assert.ok(r.data.length > 0);
  assert.ok(r.data.every((i) => ['Design', 'Analytics'].includes(i.category)));
});

test('comma-separated and repeated params both work', () => {
  const a = searchCatalog(catalog, { category: 'Design,Analytics' });
  const b = searchCatalog(catalog, { category: ['Design', 'Analytics'] });
  assert.equal(a.meta.total, b.meta.total);
});

test('search is case-insensitive and matches every word', () => {
  const r = searchCatalog(catalog, { search: 'SECURITY advanced', limit: 50 });
  assert.ok(r.data.length > 0);
  assert.ok(r.data.every((i) => i.category === 'Security' && i.level === 'Advanced'));
});

test('minRating and sort work together', () => {
  const r = searchCatalog(catalog, { minRating: '4.5', sort: 'rating', limit: 50 });
  assert.ok(r.data.every((i) => i.rating >= 4.5));
  assert.ok(r.data.every((x, i, a) => i === 0 || a[i - 1].rating >= x.rating));
});

test('page is clamped and limit is capped', () => {
  const r = searchCatalog(catalog, { page: 9999, limit: 9999 });
  assert.equal(r.meta.limit, 50);
  assert.equal(r.meta.page, r.meta.totalPages);
});

test('facet counts ignore their own filter', () => {
  const r = searchCatalog(catalog, { category: 'Security' });
  assert.ok(r.facets.category.Design > 0);
  assert.equal(r.meta.total, r.facets.level.Beginner + r.facets.level.Intermediate + r.facets.level.Advanced);
});

test('no match gives an empty page, not an error', () => {
  const r = searchCatalog(catalog, { search: 'zzzz' });
  assert.equal(r.data.length, 0);
  assert.equal(r.meta.totalPages, 1);
});
