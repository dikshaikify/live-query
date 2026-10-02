const pages = (page, total) => {
  const set = new Set([1, total, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  return nums.flatMap((n, i) => (i && n - nums[i - 1] > 1 ? ['…', n] : [n]));
};

export default function Pagination({ meta, limit, onPage, onLimit }) {
  if (!meta) return null;
  return (
    <nav className="pager" aria-label="Pagination">
      <button disabled={!meta.hasPrev} onClick={() => onPage(meta.page - 1)}>Previous</button>
      {pages(meta.page, meta.totalPages).map((n, i) =>
        n === '…' ? <span key={`d${i}`} className="dots">…</span> : (
          <button key={n} aria-current={n === meta.page ? 'page' : undefined} onClick={() => onPage(n)}>{n}</button>
        )
      )}
      <button disabled={!meta.hasNext} onClick={() => onPage(meta.page + 1)}>Next</button>
      <label className="per">
        Per page
        <select value={limit} onChange={(e) => onLimit(Number(e.target.value))}>
          {[12, 24, 48].map((n) => <option key={n}>{n}</option>)}
        </select>
      </label>
    </nav>
  );
}
