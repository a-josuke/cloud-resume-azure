const fmt = (n) => Number(n).toLocaleString()

// A ranked list with a bar behind each row (referrers, browsers, systems, devices).
export default function BarList({ data }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  if (!entries.length) return <p className="muted">No data yet.</p>
  const top = entries[0][1]

  return (
    <>
      {entries.map(([name, n]) => (
        <div className="row" key={name}>
          <span>{name}</span>
          <span className="muted">{fmt(n)}</span>
          <div className="bar">
            <span style={{ width: `${Math.round((n / top) * 100)}%` }} />
          </div>
        </div>
      ))}
    </>
  )
}