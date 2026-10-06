// Pure functions for the analytics pipeline (no Azure here, so they are easy to unit test).
//   EXTRACT  buildEvent()  -> one small row per visit, no IP, no raw user agent
//   TRANSFORM aggregate()  -> many rows become one summary per day

// Crude but honest user-agent classification: enough for a dashboard, stores nothing identifying.
function parseUserAgent(ua = '') {
  const s = String(ua).slice(0, 300);
  const isBot = /bot|crawl|spider|slurp|headless|lighthouse|curl|wget|python|node-fetch|axios|postman/i.test(s);
  let browser = 'Other';
  if (/Edg\//.test(s)) browser = 'Edge';
  else if (/OPR\/|Opera/.test(s)) browser = 'Opera';
  else if (/Firefox\//.test(s)) browser = 'Firefox';
  else if (/Chrome\//.test(s)) browser = 'Chrome';
  else if (/Safari\//.test(s)) browser = 'Safari';
  let os = 'Other';
  if (/Android/.test(s)) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(s)) os = 'iOS';
  else if (/Windows/.test(s)) os = 'Windows';
  else if (/Mac OS X|Macintosh/.test(s)) os = 'macOS';
  else if (/Linux|X11/.test(s)) os = 'Linux';
  const device = /Mobi|Android|iPhone|iPad/.test(s) ? 'mobile' : 'desktop';
  return { browser, os, device, isBot };
}

// The page sends the host of document.referrer (e.g. "www.linkedin.com"). Never trust it:
// keep only something that looks like a hostname, otherwise call it "direct".
function cleanReferrer(ref) {
  if (typeof ref !== 'string') return 'direct';
  const h = ref.trim().toLowerCase().slice(0, 100);
  if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(h) || !h.includes('.')) return 'direct';
  if (h === 'cloud.ankit-dahal.com.np') return 'direct'; // our own site is not a referrer
  return h;
}

function dayOf(date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD in UTC
}

// One row of the raw "events" table. PartitionKey = the day, so one day's data sits together.
function buildEvent({ now = new Date(), userAgent, referrer, isUnique }) {
  const ua = parseUserAgent(userAgent);
  const stamp = now.toISOString().replace(/[-:.TZ]/g, ''); // sorts by time as text
  const rand = Math.random().toString(16).slice(2, 8);
  return {
    partitionKey: dayOf(now),
    rowKey: `${stamp}-${rand}`,
    hour: now.getUTCHours(),
    browser: ua.browser,
    os: ua.os,
    device: ua.device,
    isBot: ua.isBot,
    referrer: cleanReferrer(referrer),
    isUnique: Boolean(isUnique),
  };
}

function bump(map, key) {
  map[key] = (map[key] ?? 0) + 1;
}

function top(map, n) {
  return Object.fromEntries(Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n));
}

// TRANSFORM: all event rows of ONE day -> one summary object. Same input always gives
// the same output, so re-running the job is safe (idempotent).
function aggregate(day, events) {
  const out = {
    day,
    views: 0,
    humanViews: 0,
    botViews: 0,
    uniqueVisitors: 0,
    byHour: Array(24).fill(0),
    byBrowser: {},
    byOs: {},
    byDevice: {},
    byReferrer: {},
  };
  for (const e of events) {
    out.views += 1;
    if (e.isBot) {
      out.botViews += 1;
      continue; // bots count as views, but stay out of the human breakdowns
    }
    out.humanViews += 1;
    if (e.isUnique) out.uniqueVisitors += 1;
    if (Number.isInteger(e.hour) && e.hour >= 0 && e.hour < 24) out.byHour[e.hour] += 1;
    bump(out.byBrowser, e.browser ?? 'Other');
    bump(out.byOs, e.os ?? 'Other');
    bump(out.byDevice, e.device ?? 'desktop');
    bump(out.byReferrer, e.referrer ?? 'direct');
  }
  out.byReferrer = top(out.byReferrer, 10);
  return out;
}

// Table Storage can't hold nested objects, so maps and arrays are stored as JSON text.
function toStatsEntity(summary) {
  return {
    partitionKey: 'daily',
    rowKey: summary.day,
    views: summary.views,
    humanViews: summary.humanViews,
    botViews: summary.botViews,
    uniqueVisitors: summary.uniqueVisitors,
    byHour: JSON.stringify(summary.byHour),
    byBrowser: JSON.stringify(summary.byBrowser),
    byOs: JSON.stringify(summary.byOs),
    byDevice: JSON.stringify(summary.byDevice),
    byReferrer: JSON.stringify(summary.byReferrer),
  };
}

function fromStatsEntity(e) {
  const parse = (v, fallback) => {
    try { return JSON.parse(v); } catch { return fallback; }
  };
  return {
    day: e.rowKey,
    views: e.views ?? 0,
    humanViews: e.humanViews ?? 0,
    botViews: e.botViews ?? 0,
    uniqueVisitors: e.uniqueVisitors ?? 0,
    byHour: parse(e.byHour, Array(24).fill(0)),
    byBrowser: parse(e.byBrowser, {}),
    byOs: parse(e.byOs, {}),
    byDevice: parse(e.byDevice, {}),
    byReferrer: parse(e.byReferrer, {}),
  };
}

// The list of day strings for the last `days` days, oldest first, ending today (UTC).
function lastDays(days, now = new Date()) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    out.push(dayOf(new Date(now.getTime() - i * 86400000)));
  }
  return out;
}

module.exports = {
  parseUserAgent, cleanReferrer, dayOf, buildEvent, aggregate,
  toStatsEntity, fromStatsEntity, lastDays,
};
