const test = require('node:test');
const assert = require('node:assert');
const {
  parseUserAgent, cleanReferrer, buildEvent, aggregate, toStatsEntity, fromStatsEntity, lastDays,
} = require('../src/events');

const CHROME_WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const SAFARI_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const EDGE = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/129.0 Safari/537.36 Edg/129.0';

test('parseUserAgent: browsers, os, device', () => {
  assert.deepStrictEqual(parseUserAgent(CHROME_WIN), { browser: 'Chrome', os: 'Windows', device: 'desktop', isBot: false });
  assert.deepStrictEqual(parseUserAgent(SAFARI_IOS), { browser: 'Safari', os: 'iOS', device: 'mobile', isBot: false });
  assert.strictEqual(parseUserAgent(EDGE).browser, 'Edge'); // Edge also says Chrome: order matters
});

test('parseUserAgent: bots and missing input', () => {
  assert.strictEqual(parseUserAgent('Googlebot/2.1').isBot, true);
  assert.strictEqual(parseUserAgent('curl/8.4.0').isBot, true);
  assert.strictEqual(parseUserAgent(undefined).browser, 'Other');
  assert.strictEqual(parseUserAgent('x'.repeat(5000)).browser, 'Other'); // long input is cut, not crashed
});

test('cleanReferrer: accepts hostnames, rejects everything else', () => {
  assert.strictEqual(cleanReferrer('www.LinkedIn.com'), 'www.linkedin.com');
  assert.strictEqual(cleanReferrer(''), 'direct');
  assert.strictEqual(cleanReferrer(undefined), 'direct');
  assert.strictEqual(cleanReferrer('<script>alert(1)</script>'), 'direct');
  assert.strictEqual(cleanReferrer('https://evil.example/path'), 'direct');
  assert.strictEqual(cleanReferrer('localhost'), 'direct');
  assert.strictEqual(cleanReferrer('cloud.ankit-dahal.com.np'), 'direct');
});

test('buildEvent: no IP, day partition, sortable row key', () => {
  const now = new Date('2026-10-06T14:05:09.123Z');
  const e = buildEvent({ now, userAgent: CHROME_WIN, referrer: 'news.ycombinator.com', isUnique: true });
  assert.strictEqual(e.partitionKey, '2026-10-06');
  assert.match(e.rowKey, /^20261006140509123-[0-9a-f]+$/);
  assert.strictEqual(e.hour, 14);
  assert.strictEqual(e.referrer, 'news.ycombinator.com');
  assert.strictEqual(e.isUnique, true);
  assert.ok(!('ip' in e));
});

test('aggregate: counts, bots excluded from breakdowns, top referrers', () => {
  const ev = (o) => ({ hour: 9, browser: 'Chrome', os: 'Windows', device: 'desktop', isBot: false, referrer: 'direct', isUnique: false, ...o });
  const day = aggregate('2026-10-06', [
    ev({ isUnique: true }),
    ev({}),
    ev({ hour: 21, browser: 'Safari', os: 'iOS', device: 'mobile', referrer: 'www.linkedin.com', isUnique: true }),
    ev({ isBot: true, browser: 'Other' }),
  ]);
  assert.strictEqual(day.views, 4);
  assert.strictEqual(day.humanViews, 3);
  assert.strictEqual(day.botViews, 1);
  assert.strictEqual(day.uniqueVisitors, 2);
  assert.strictEqual(day.byHour[9], 2);
  assert.strictEqual(day.byHour[21], 1);
  assert.deepStrictEqual(day.byBrowser, { Chrome: 2, Safari: 1 });
  assert.deepStrictEqual(day.byDevice, { desktop: 2, mobile: 1 });
  assert.strictEqual(day.byReferrer['www.linkedin.com'], 1);
});

test('aggregate: empty day and idempotency', () => {
  const empty = aggregate('2026-10-07', []);
  assert.strictEqual(empty.views, 0);
  assert.strictEqual(empty.byHour.length, 24);
  const rows = [{ hour: 1, browser: 'Chrome', os: 'Linux', device: 'desktop', isBot: false, referrer: 'direct', isUnique: true }];
  assert.deepStrictEqual(aggregate('d', rows), aggregate('d', rows));
});

test('aggregate: referrer list is capped at 10', () => {
  const rows = Array.from({ length: 15 }, (_, i) => ({ hour: 0, browser: 'Chrome', os: 'Linux', device: 'desktop', isBot: false, referrer: `site${i}.example.com`, isUnique: false }));
  assert.strictEqual(Object.keys(aggregate('d', rows).byReferrer).length, 10);
});

test('entity round trip keeps the data', () => {
  const s = aggregate('2026-10-06', [{ hour: 3, browser: 'Edge', os: 'Windows', device: 'desktop', isBot: false, referrer: 'direct', isUnique: true }]);
  const back = fromStatsEntity(toStatsEntity(s));
  assert.deepStrictEqual(back, s);
  assert.strictEqual(toStatsEntity(s).partitionKey, 'daily');
  assert.strictEqual(typeof toStatsEntity(s).byBrowser, 'string');
});

test('fromStatsEntity tolerates a missing day and bad JSON', () => {
  const z = fromStatsEntity({ rowKey: '2026-01-01' });
  assert.strictEqual(z.views, 0);
  assert.strictEqual(z.byHour.length, 24);
  assert.deepStrictEqual(fromStatsEntity({ rowKey: 'x', byBrowser: '{not json' }).byBrowser, {});
});

test('lastDays: oldest first, ends today, crosses month boundary', () => {
  assert.deepStrictEqual(lastDays(3, new Date('2026-11-01T10:00:00Z')), ['2026-10-30', '2026-10-31', '2026-11-01']);
  assert.strictEqual(lastDays(30).length, 30);
});
