// Dashboard: fetch the daily summaries and draw them with plain SVG/DOM (no libraries, no innerHTML,
// so it works under a strict Content-Security-Policy and can't be tricked by odd data).
(() => {
  const API = window.CRC_CONFIG.apiUrl.replace(/visitorCount$/, 'stats') + '?days=30';
  const SVG = 'http://www.w3.org/2000/svg';

  const h = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const s = (tag, attrs = {}, text) => {
    const n = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  const fmt = (n) => Number(n).toLocaleString();

  // Grouped bar chart. series = [{ cls, name, values: [...] }, ...]; labels = x axis labels.
  // opts: title(i) -> tooltip heading; unit (e.g. 'views'); pad (empty future columns after the data);
  //       visible (columns shown at once; enables horizontal scrolling); focus (column index to
  //       place at the `focusSlot`-th visible position on load); labelEvery (x label step).
  function barChart(target, labels, series, opts = {}) {
    const H = 220, axisW = 34, padB = 26, padT = 10;
    const plotH = H - padB - padT;
    const pad = opts.pad || 0;
    const cols = labels.length + pad;
    const max = Math.max(1, ...series.flatMap((x) => x.values));

    const wrap = h('div', 'chart-wrap');
    const tip = h('div', 'chart-tip');
    tip.hidden = true;
    wrap.append(tip);
    target.replaceChildren(wrap);

    // fixed y-axis (stays in place while the plot scrolls)
    const axis = s('svg', { class: 'chart chart-axis', width: axisW, height: H, role: 'img' });
    axis.append(s('text', { x: 2, y: padT + 8 }, fmt(max)), s('text', { x: 2, y: padT + plotH }, '0'));
    const scroller = h('div', 'chart-scroll');
    const body = h('div', 'chart-body');
    body.append(axis, scroller);
    wrap.prepend(body);

    const availW = Math.max(200, body.clientWidth - axisW);
    const colW = opts.visible ? availW / opts.visible : availW / cols;
    const W = colW * cols;
    const svg = s('svg', { class: 'chart', width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: 'img' });
    svg.append(s('line', { x1: 0, y1: padT + plotH, x2: W, y2: padT + plotH, class: 'axis' }));

    const bar = Math.min((colW * 0.7) / series.length, 22);
    const used = bar * series.length;
    const step = opts.labelEvery || 1;

    const showTip = (e, i) => {
      tip.replaceChildren(h('div', 'tip-title', opts.title ? opts.title(i) : labels[i]));
      series.forEach((ser) => {
        const row = h('div', 'tip-row');
        const dot = h('span', 'tip-dot');
        dot.classList.add(ser.cls);
        row.append(dot, h('span', 'tip-name', `${ser.name || (opts.unit || 'views')}: `), h('b', '', fmt(ser.values[i])));
        tip.append(row);
      });
      tip.hidden = false;
      moveTip(e);
    };
    const moveTip = (e) => {
      const r = wrap.getBoundingClientRect();
      const half = tip.offsetWidth / 2;
      const x = Math.min(Math.max(e.clientX - r.left, half + 4), r.width - half - 4);
      tip.style.left = `${x}px`;
      tip.style.top = `${Math.max(e.clientY - r.top - 14, tip.offsetHeight + 4)}px`;
    };

    for (let i = 0; i < cols; i++) {
      const gx = i * colW;
      const real = i < labels.length;
      if (real) {
        series.forEach((ser, j) => {
          const v = ser.values[i];
          const bh = (v / max) * plotH;
          svg.append(s('rect', { x: gx + (colW - used) / 2 + j * bar, y: padT + plotH - bh, width: Math.max(1, bar - 1), height: bh, class: `${ser.cls} bar-rect` }));
        });
      }
      if (real && i % step === 0 || opts.futureLabels && !real && opts.futureLabels[i - labels.length] && i % step === 0) {
        const text = real ? labels[i] : opts.futureLabels[i - labels.length];
        svg.append(s('text', { x: gx + colW / 2, y: H - 8, 'text-anchor': 'middle', class: real && opts.focus === i ? 'x-today' : '' }, text));
      }
      if (real) {
        // full-height invisible hit area so even tiny/zero bars are easy to hover
        const hit = s('rect', { x: gx, y: padT, width: colW, height: plotH + padB - 8, class: 'hit' });
        hit.addEventListener('mouseenter', (e) => showTip(e, i));
        hit.addEventListener('mousemove', moveTip);
        hit.addEventListener('mouseleave', () => { tip.hidden = true; });
        svg.append(hit);
      }
    }
    scroller.append(svg);
    if (opts.visible && opts.focus !== undefined) {
      // put the focused column (today) in the 3rd visible slot; earlier days are a scroll to the left
      scroller.scrollLeft = Math.max(0, (opts.focus - (opts.focusSlot ?? 2)) * colW);
    }
  }

  function barList(target, obj) {
    const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
    if (!entries.length) { target.replaceChildren(h('p', 'muted', 'No data yet.')); return; }
    const top = entries[0][1];
    target.replaceChildren(...entries.map(([name, n]) => {
      const row = h('div', 'row');
      row.append(h('span', '', name), h('span', 'muted', fmt(n)));
      const bar = h('div', 'bar');
      const fill = h('span');
      fill.style.width = `${Math.round((n / top) * 100)}%`;
      bar.append(fill);
      row.append(bar);
      return row;
    }));
  }

  function mergeMaps(maps) {
    const out = {};
    for (const m of maps) for (const [k, v] of Object.entries(m)) out[k] = (out[k] ?? 0) + v;
    return out;
  }

  async function main() {
    const status = document.getElementById('status');
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { days } = await res.json();

      const humans = sum(days.map((d) => d.humanViews));
      const bots = sum(days.map((d) => d.botViews));
      const uniques = sum(days.map((d) => d.uniqueVisitors));
      const tiles = document.getElementById('tiles');
      [[humans + bots, 'total views'], [humans, 'human views'], [uniques, 'unique visitors'], [bots, 'bot views']]
        .forEach(([n, l]) => { const t = h('div', 'tile'); t.append(h('div', 'n', fmt(n)), h('div', 'l', l)); tiles.append(t); });
      tiles.hidden = false;

      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const prettyDay = (iso) => { const [, m, d] = iso.split('-'); return `${MONTHS[Number(m) - 1]} ${Number(d)}`; };
      const todayIdx = days.length - 1;
      // empty upcoming days after today so today sits in the 3rd visible column; earlier days scroll left
      const FUTURE = 4;
      const futureLabels = Array.from({ length: FUTURE }, (_, k) => {
        const [y, m, d] = days[todayIdx].day.split('-').map(Number);
        return new Date(Date.UTC(y, m - 1, d + k + 1)).toISOString().slice(5, 10);
      });
      const byHour = Array.from({ length: 24 }, (_, i) => sum(days.map((d) => d.byHour[i] ?? 0)));
      const drawCharts = () => {
        barChart(document.getElementById('chart-days'), days.map((d) => d.day.slice(5)), [
          { cls: 's-humans', name: 'Human views', values: days.map((d) => d.humanViews) },
          { cls: 's-uniques', name: 'Unique visitors', values: days.map((d) => d.uniqueVisitors) },
          { cls: 's-bots', name: 'Bot views', values: days.map((d) => d.botViews) },
        ], {
          visible: 7, pad: FUTURE, futureLabels, focus: todayIdx, focusSlot: 2,
          title: (i) => prettyDay(days[i].day) + (i === todayIdx ? ' (today)' : ''),
        });
        barChart(document.getElementById('chart-hours'), byHour.map((_, i) => String(i).padStart(2, '0')),
          [{ cls: 's-humans', name: 'Human views', values: byHour }], {
            labelEvery: 2,
            title: (i) => `${String(i).padStart(2, '0')}:00 – ${String(i).padStart(2, '0')}:59 UTC`,
          });
      };
      drawCharts();
      let resizeTimer;
      let lastW = window.innerWidth;
      window.addEventListener('resize', () => {
        if (window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(drawCharts, 150);
      });

      barList(document.getElementById('list-referrer'), mergeMaps(days.map((d) => d.byReferrer)));
      barList(document.getElementById('list-browser'), mergeMaps(days.map((d) => d.byBrowser)));
      barList(document.getElementById('list-os'), mergeMaps(days.map((d) => d.byOs)));
      barList(document.getElementById('list-device'), mergeMaps(days.map((d) => d.byDevice)));
      status.textContent = 'Last 30 days. Updated hourly.';
    } catch (err) {
      status.textContent = `Stats are unavailable right now (${err.message}).`;
    }
  }
  main();
})();
