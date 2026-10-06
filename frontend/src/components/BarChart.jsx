import { useLayoutEffect, useEffect, useRef, useState } from 'react'

const H = 220
const AXIS_W = 34
const PAD_B = 26
const PAD_T = 10
const PLOT_H = H - PAD_B - PAD_T
const fmt = (n) => Number(n).toLocaleString()

// labels: x axis labels. series: [{ cls, name, values }]. Options (all optional):
//   title(i)       heading of the tooltip       unit         fallback series name
//   pad            empty columns after the data futureLabels labels for those columns
//   visible        columns shown at once (turns on horizontal scrolling)
//   focus          column to bring into view    focusSlot    which visible slot it lands in
//   labelEvery     show every n-th x label
export default function BarChart({
  labels, series, title, unit = 'views', pad = 0, futureLabels, visible, focus, focusSlot = 2, labelEvery = 1,
}) {
  const wrapRef = useRef(null)
  const scrollerRef = useRef(null)
  const tipRef = useRef(null)
  const [availW, setAvailW] = useState(null) // width available for the plot, measured once the page is on screen
  const [tip, setTip] = useState(null) // { i, x, y } while hovering a column

  // Measure the container (and again whenever its width changes).
  // "contain: inline-size" on the wrapper stops the wide chart from stretching the
  // wrapper, so measuring cannot get stuck in a loop.
  useEffect(() => {
    const el = wrapRef.current
    const observer = new ResizeObserver(([entry]) => {
      setAvailW(Math.max(200, Math.floor(entry.contentRect.width) - AXIS_W))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const cols = labels.length + pad
  const max = Math.max(1, ...series.flatMap((s) => s.values))
  const colW = availW === null ? 0 : visible ? availW / visible : availW / cols
  const W = colW * cols
  const bar = Math.min((colW * 0.7) / Math.max(series.length, 1), 22)
  const used = bar * series.length

  // Put the focused column (today) in the chosen visible slot; earlier days are a scroll to the left.
  useLayoutEffect(() => {
    const el = scrollerRef.current
    if (el && availW !== null && visible && focus !== undefined) {
      el.scrollLeft = Math.max(0, (focus - focusSlot) * colW)
    }
  }, [availW, visible, focus, focusSlot, colW])

  // Place the tooltip next to the pointer, kept inside the chart.
  useLayoutEffect(() => {
    const t = tipRef.current
    const w = wrapRef.current
    if (!tip || !t || !w) return
    const r = w.getBoundingClientRect()
    const half = t.offsetWidth / 2
    const x = Math.min(Math.max(tip.x - r.left, half + 4), r.width - half - 4)
    t.style.left = `${x}px`
    t.style.top = `${Math.max(tip.y - r.top - 14, t.offsetHeight + 4)}px`
  }, [tip])

  const onHover = (e, i) => setTip({ i, x: e.clientX, y: e.clientY })

  return (
    <div className="chart-wrap" ref={wrapRef} style={{ contain: 'inline-size' }}>
      <div className="chart-body">
        <svg className="chart chart-axis" width={AXIS_W} height={H} role="img" aria-label="Chart scale">
          <text x="2" y={PAD_T + 8}>{fmt(max)}</text>
          <text x="2" y={PAD_T + PLOT_H}>0</text>
        </svg>
        <div className="chart-scroll" ref={scrollerRef}>
          {availW !== null && (
            <svg className="chart" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bar chart">
              <line x1="0" y1={PAD_T + PLOT_H} x2={W} y2={PAD_T + PLOT_H} className="axis" />
              {Array.from({ length: cols }, (_, i) => {
                const gx = i * colW
                const real = i < labels.length
                const futureLabel = !real && futureLabels ? futureLabels[i - labels.length] : undefined
                const showLabel = i % labelEvery === 0 && (real || futureLabel)
                return (
                  <g key={i}>
                    {real &&
                      series.map((ser, j) => {
                        const bh = (ser.values[i] / max) * PLOT_H
                        return (
                          <rect
                            key={ser.cls}
                            x={gx + (colW - used) / 2 + j * bar}
                            y={PAD_T + PLOT_H - bh}
                            width={Math.max(1, bar - 1)}
                            height={bh}
                            className={`${ser.cls} bar-rect`}
                          />
                        )
                      })}
                    {showLabel && (
                      <text
                        x={gx + colW / 2}
                        y={H - 8}
                        textAnchor="middle"
                        className={real && focus === i ? 'x-today' : ''}
                      >
                        {real ? labels[i] : futureLabel}
                      </text>
                    )}
                    {real && (
                      <rect
                        x={gx}
                        y={PAD_T}
                        width={colW}
                        height={PLOT_H + PAD_B - 8}
                        className="hit"
                        onMouseEnter={(e) => onHover(e, i)}
                        onMouseMove={(e) => onHover(e, i)}
                        onMouseLeave={() => setTip(null)}
                      />
                    )}
                  </g>
                )
              })}
            </svg>
          )}
        </div>
      </div>
      <div className="chart-tip" ref={tipRef} hidden={!tip}>
        {tip && (
          <>
            <div className="tip-title">{title ? title(tip.i) : labels[tip.i]}</div>
            {series.map((ser) => (
              <div className="tip-row" key={ser.cls}>
                <span className={`tip-dot ${ser.cls}`}></span>
                <span className="tip-name">{`${ser.name || unit}: `}</span>
                <b>{fmt(ser.values[tip.i])}</b>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}