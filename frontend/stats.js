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

  // Grouped bar chart. series = [{ cls, values: [...] }, ...]; labels = x axis labels.
  function barChart(target, labels, series) {
    const W = 600, H = 200, padL = 34, padB = 22, padT = 8;
    const max = Math.max(1, ...series.flatMap((x) => x.values));
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img' });
    const plotW = W - padL, plotH = H - padB - padT;
    svg.append(s('line', { x1: padL, y1: padT + plotH, x2: W, y2: padT + plotH, class: 'axis' }));
    svg.append(s('text', { x: 2, y: padT + 8 }, fmt(max)));
    svg.append(s('text', { x: 2, y: padT + plotH }, '0'));
    const group = plotW / labels.length;
    const bar = (group * 0.8) / series.length;
    labels.forEach((label, i) => {
      series.forEach((ser, j) => {
        const v = ser.values[i];
        const bh = (v / max) * plotH;
        const r = s('rect', { x: padL + i * group + group * 0.1 + j * bar, y: padT + plotH - bh, width: Math.max(1, bar - 1), height: bh, class: ser.cls });
        r.append(s('title', {}, `${label}: ${fmt(v)}`));
        svg.append(r);
      });
      const last = i === labels.length - 1;
      if (i === 0 || last || (i % Math.ceil(labels.length / 6) === 0 && labels.length - i > 3)) {
        // the last label is right-aligned so it is never cut off by the edge
        svg.append(s('text', last ? { x: W - 2, y: H - 6, 'text-anchor': 'end' } : { x: padL + i * group, y: H - 6 }, label));
      }
    });
    target.replaceChildren(svg);
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

      barChart(document.getElementById('chart-days'), days.map((d) => d.day.slice(5)), [
        { cls: 's-humans', values: days.map((d) => d.humanViews) },
        { cls: 's-uniques', values: days.map((d) => d.uniqueVisitors) },
        { cls: 's-bots', values: days.map((d) => d.botViews) },
      ]);
      const byHour = Array.from({ length: 24 }, (_, i) => sum(days.map((d) => d.byHour[i] ?? 0)));
      barChart(document.getElementById('chart-hours'), byHour.map((_, i) => String(i).padStart(2, '0')), [{ cls: 's-humans', values: byHour }]);

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
