const fmt = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`);

function Card({ item }) {
  return (
    <article className="card" data-cat={item.category}>
      <span className="tag">{item.category}</span>
      <h3>{item.title}</h3>
      <div className="meta">
        <span>{item.level}</span>
        <span>{fmt(item.durationMinutes)}</span>
        <span className="rate" aria-label={`Rated ${item.rating} out of 5`}>★ {item.rating.toFixed(1)}</span>
      </div>
    </article>
  );
}

const Skeleton = () => <div className="card skel" aria-hidden="true"><i /><i /><i /></div>;

export default function ResultGrid({ data, loading, error, limit, onRetry, onClear }) {
  if (error) {
    return (
      <div className="state" role="alert">
        <p>{error}</p>
        <button onClick={onRetry}>Try again</button>
      </div>
    );
  }
  if (!data) return <div className="grid" aria-busy="true">{Array.from({ length: limit }, (_, i) => <Skeleton key={i} />)}</div>;
  if (data.data.length === 0) {
    return (
      <div className="state">
        <p>No resources match these filters.</p>
        <button onClick={onClear}>Clear search and filters</button>
      </div>
    );
  }
  return (
    <div className={`grid ${loading ? 'stale' : ''}`} aria-busy={loading}>
      {data.data.map((i) => <Card key={i.id} item={i} />)}
    </div>
  );
}
