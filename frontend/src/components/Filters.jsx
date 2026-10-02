function Group({ title, name, options, selected, counts, onToggle }) {
  return (
    <fieldset>
      <legend>{title}</legend>
      {options.map((o) => {
        const n = counts?.[o] ?? 0;
        const on = selected.includes(o);
        return (
          <label key={o} className={`check ${n === 0 && !on ? 'dim' : ''}`}>
            <input type="checkbox" checked={on} disabled={n === 0 && !on} onChange={() => onToggle(name, o)} />
            <span>{o}</span>
            <span className="count">{n}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

export default function Filters({ f, meta, facets, onToggle, onChange, onReset }) {
  return (
    <details className="filters" open>
      <summary>Filters</summary>
      <Group title="Category" name="category" options={meta.categories} selected={f.category} counts={facets?.category} onToggle={onToggle} />
      <Group title="Level" name="level" options={meta.levels} selected={f.level} counts={facets?.level} onToggle={onToggle} />
      <fieldset>
        <legend>Minimum rating</legend>
        <select value={f.minRating} onChange={(e) => onChange({ minRating: Number(e.target.value) })} aria-label="Minimum rating">
          <option value={0}>Any rating</option>
          <option value={3.5}>3.5 and up</option>
          <option value={4}>4.0 and up</option>
          <option value={4.5}>4.5 and up</option>
        </select>
      </fieldset>
      <button className="ghost" onClick={onReset}>Clear all filters</button>
    </details>
  );
}
