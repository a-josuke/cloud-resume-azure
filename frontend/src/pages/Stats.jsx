import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import BarChart from '../components/BarChart.jsx'
import BarList from '../components/BarList.jsx'
import { STATS_URL } from '../config.js'
import '../stats.css'

const FUTURE = 4 // empty upcoming days after today, so today sits in the 3rd visible column
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const LEGEND = [
  { key: 'humans', label: 'human views' },
  { key: 'uniques', label: 'unique visitors' },
  { key: 'bots', label: 'bot views' },
]

const sum = (arr) => arr.reduce((a, b) => a + b, 0)
const fmt = (n) => Number(n).toLocaleString()
const prettyDay = (iso) => {
  const [, m, d] = iso.split('-')
  return `${MONTHS[Number(m) - 1]} ${Number(d)}`
}
const mergeMaps = (maps) => {
  const out = {}
  for (const m of maps) for (const [k, v] of Object.entries(m)) out[k] = (out[k] ?? 0) + v
  return out
}

export default function Stats() {
  const [days, setDays] = useState(null)
  const [error, setError] = useState(null)
  const [enabled, setEnabled] = useState({ humans: true, uniques: true, bots: true })

  useEffect(() => {
    let active = true
    fetch(`${STATS_URL}?days=30`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (active) setDays(data.days)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    if (!days || days.length === 0) return null
    const humans = sum(days.map((d) => d.humanViews))
    const bots = sum(days.map((d) => d.botViews))
    const uniques = sum(days.map((d) => d.uniqueVisitors))
    const todayIdx = days.length - 1
    const [y, m, d] = days[todayIdx].day.split('-').map(Number)
    return {
      humans,
      bots,
      uniques,
      todayIdx,
      futureLabels: Array.from({ length: FUTURE }, (_, k) =>
        new Date(Date.UTC(y, m - 1, d + k + 1)).toISOString().slice(5, 10),
      ),
      byHour: Array.from({ length: 24 }, (_, i) => sum(days.map((x) => x.byHour[i] ?? 0))),
      series: [
        { key: 'humans', cls: 's-humans', name: 'Human views', values: days.map((x) => x.humanViews) },
        { key: 'uniques', cls: 's-uniques', name: 'Unique visitors', values: days.map((x) => x.uniqueVisitors) },
        { key: 'bots', cls: 's-bots', name: 'Bot views', values: days.map((x) => x.botViews) },
      ],
      referrers: mergeMaps(days.map((x) => x.byReferrer)),
      browsers: mergeMaps(days.map((x) => x.byBrowser)),
      systems: mergeMaps(days.map((x) => x.byOs)),
      devices: mergeMaps(days.map((x) => x.byDevice)),
    }
  }, [days])

  let status = 'Loading…'
  if (error) status = `Stats are unavailable right now (${error}).`
  else if (days && days.length === 0) status = 'No data yet.'
  else if (days) status = 'Last 30 days. Updated hourly.'

  const tiles = stats
    ? [
        [stats.humans + stats.bots, 'total views'],
        [stats.humans, 'human views'],
        [stats.uniques, 'unique visitors'],
        [stats.bots, 'bot views'],
      ]
    : []

  return (
    <>
      <Header variant="stats" />

      <main className="bento-section">
        <div className="container">
          <div className="bento-grid">
            <article className="bento-card stats-hero">
              <span className="card-subtitle">Cloud Resume Challenge · Live analytics</span>
              <h1 className="stats-title">Visitor <span className="cta-accent">stats.</span></h1>
              <p className="muted" id="status">{status}</p>
            </article>

            <section className="tiles" id="tiles" hidden={!stats}>
              {tiles.map(([n, label]) => (
                <div className="tile" key={label}>
                  <div className="n">{fmt(n)}</div>
                  <div className="l">{label}</div>
                </div>
              ))}
            </section>

            {stats && (
              <>
                <section className="bento-card panel">
                  <span className="card-subtitle">Last 30 days</span>
                  <h2 className="card-title">Daily visits</h2>
                  <div id="chart-days">
                    <BarChart
                      labels={days.map((x) => x.day.slice(5))}
                      series={stats.series.filter((s) => enabled[s.key])}
                      visible={7}
                      pad={FUTURE}
                      futureLabels={stats.futureLabels}
                      focus={stats.todayIdx}
                      focusSlot={2}
                      title={(i) => prettyDay(days[i].day) + (i === stats.todayIdx ? ' (today)' : '')}
                    />
                  </div>
                  <div className="legend" id="legend-days" role="group" aria-label="Toggle metrics in the daily visits chart">
                    {LEGEND.map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        className="legend-btn"
                        data-series={key}
                        aria-pressed={enabled[key]}
                        onClick={() => setEnabled((e) => ({ ...e, [key]: !e[key] }))}
                      >
                        <span className={`key ${key}`}></span> {label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bento-card panel">
                  <span className="card-subtitle">UTC</span>
                  <h2 className="card-title">When people visit (hour of day)</h2>
                  <div id="chart-hours">
                    <BarChart
                      labels={stats.byHour.map((_, i) => String(i).padStart(2, '0'))}
                      series={[{ cls: 's-humans', name: 'Human views', values: stats.byHour }]}
                      labelEvery={2}
                      title={(i) => `${String(i).padStart(2, '0')}:00 – ${String(i).padStart(2, '0')}:59 UTC`}
                    />
                  </div>
                </section>

                <div className="grid">
                  <section className="bento-card panel">
                    <span className="card-subtitle">Source</span><h2 className="card-title">Where from</h2>
                    <div id="list-referrer"><BarList data={stats.referrers} /></div>
                  </section>
                  <section className="bento-card panel">
                    <span className="card-subtitle">Client</span><h2 className="card-title">Browser</h2>
                    <div id="list-browser"><BarList data={stats.browsers} /></div>
                  </section>
                  <section className="bento-card panel">
                    <span className="card-subtitle">Platform</span><h2 className="card-title">System</h2>
                    <div id="list-os"><BarList data={stats.systems} /></div>
                  </section>
                  <section className="bento-card panel">
                    <span className="card-subtitle">Form factor</span><h2 className="card-title">Device</h2>
                    <div id="list-device"><BarList data={stats.devices} /></div>
                  </section>
                </div>
              </>
            )}

            <p className="muted privacy-note">
              No IP addresses or personal data are stored: each visit is saved as a browser type, a system type, a
              referring website name and the hour. Raw rows are deleted after 90 days.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}