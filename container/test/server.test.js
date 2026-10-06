const test = require('node:test');
const assert = require('node:assert');
const { createApp, toServer } = require('../src/server');

// Fakes: the same shape as the real Azure adapters, but in memory.
function fakes() {
  const state = { counter: null, seen: new Set(), events: [], failAnalytics: false, failStore: false };
  return {
    state,
    store: {
      async getCounter() { if (state.failStore) throw new Error('cosmos is down: secret-connection-detail'); return state.counter; },
      async saveCounter(d) { state.counter = { ...d }; },
      async markVisit(id) { if (state.seen.has(id)) return false; state.seen.add(id); return true; },
    },
    analytics: {
      async record(e) { if (state.failAnalytics) throw new Error('tables down'); state.events.push(e); },
      async readDays() { return []; },
    },
  };
}

async function withServer(overrides, fn) {
  const f = fakes();
  const quiet = { warn() {}, error() {}, log() {} };
  const handle = createApp({ store: f.store, analytics: f.analytics, salt: 'test-salt', allowedOrigins: ['https://site.example'], log: quiet, revision: 'rev-1', ...overrides });
  const server = toServer(handle);
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try { await fn(base, f); } finally { await new Promise((r) => server.close(r)); }
}

test('visitorCount: views go up by one, a repeat visitor is not unique again', async () => {
  await withServer({}, async (base) => {
    const h = { 'x-forwarded-for': '203.0.113.7:5000', 'user-agent': 'Mozilla/5.0 (Windows NT 10.0) Chrome/129.0 Safari/537.36' };
    const a = await (await fetch(`${base}/api/visitorCount`, { headers: h })).json();
    const b = await (await fetch(`${base}/api/visitorCount`, { headers: h })).json();
    assert.deepStrictEqual(a, { count: 1, uniqueCount: 1 });
    assert.deepStrictEqual(b, { count: 2, uniqueCount: 1 });
    const other = await (await fetch(`${base}/api/visitorCount`, { headers: { ...h, 'x-forwarded-for': '198.51.100.9' } })).json();
    assert.deepStrictEqual(other, { count: 3, uniqueCount: 2 });
  });
});

test('visitorCount: records an analytics event without the IP, with a cleaned referrer', async () => {
  await withServer({}, async (base, f) => {
    await fetch(`${base}/api/visitorCount?ref=www.linkedin.com`, { headers: { 'x-forwarded-for': '203.0.113.7', 'user-agent': 'Mozilla/5.0 (Windows NT 10.0) Chrome/129.0 Safari/537.36' } });
    await fetch(`${base}/api/visitorCount?ref=${encodeURIComponent('<script>')}`);
    assert.strictEqual(f.state.events.length, 2);
    assert.strictEqual(f.state.events[0].referrer, 'www.linkedin.com');
    assert.strictEqual(f.state.events[0].browser, 'Chrome');
    assert.strictEqual(f.state.events[1].referrer, 'direct');
    assert.ok(!JSON.stringify(f.state.events).includes('203.0.113.7'));
  });
});

test('an analytics failure never breaks the counter', async () => {
  await withServer({}, async (base, f) => {
    f.state.failAnalytics = true;
    const res = await fetch(`${base}/api/visitorCount`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual((await res.json()).count, 1);
  });
});

test('a database failure returns a generic 500 and leaks nothing', async () => {
  await withServer({}, async (base, f) => {
    f.state.failStore = true;
    const res = await fetch(`${base}/api/visitorCount`);
    const text = await res.text();
    assert.strictEqual(res.status, 500);
    assert.ok(!text.includes('secret-connection-detail'));
    assert.deepStrictEqual(JSON.parse(text), { error: 'internal error' });
  });
});

test('CORS: allowed site gets the header, a stranger does not', async () => {
  await withServer({}, async (base) => {
    const ok = await fetch(`${base}/api/visitorCount`, { headers: { Origin: 'https://site.example' } });
    assert.strictEqual(ok.headers.get('access-control-allow-origin'), 'https://site.example');
    const bad = await fetch(`${base}/api/visitorCount`, { headers: { Origin: 'https://evil.example' } });
    assert.strictEqual(bad.headers.get('access-control-allow-origin'), null);
    const none = await fetch(`${base}/api/visitorCount`);
    assert.strictEqual(none.headers.get('access-control-allow-origin'), null);
  });
});

test('healthz, unknown paths, wrong methods', async () => {
  await withServer({}, async (base) => {
    const h = await fetch(`${base}/healthz`);
    assert.strictEqual(h.status, 200);
    assert.strictEqual(h.headers.get('x-app-revision'), 'rev-1');
    assert.strictEqual((await fetch(`${base}/nope`)).status, 404);
    const del = await fetch(`${base}/api/visitorCount`, { method: 'DELETE' });
    assert.strictEqual(del.status, 405);
    assert.strictEqual(del.headers.get('allow'), 'GET');
    const pre = await fetch(`${base}/api/visitorCount`, { method: 'OPTIONS', headers: { Origin: 'https://site.example' } });
    assert.strictEqual(pre.status, 204);
  });
});

test('stats: always returns the asked number of days, bad input falls back to 30', async () => {
  await withServer({ now: () => new Date('2026-10-06T12:00:00Z') }, async (base) => {
    const three = await (await fetch(`${base}/api/stats?days=3`)).json();
    assert.deepStrictEqual(three.days.map((d) => d.day), ['2026-10-04', '2026-10-05', '2026-10-06']);
    assert.strictEqual(three.days[0].views, 0);
    assert.strictEqual((await (await fetch(`${base}/api/stats?days=abc`)).json()).days.length, 30);
    assert.strictEqual((await (await fetch(`${base}/api/stats?days=9999`)).json()).days.length, 30);
    assert.strictEqual((await (await fetch(`${base}/api/stats`)).json()).days.length, 30);
  });
});
