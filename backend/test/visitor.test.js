const test = require('node:test');
const assert = require('node:assert');
const { clientIp, visitorId } = require('../src/visitor');

test('clientIp strips the port and extra proxies', () => {
  assert.strictEqual(clientIp('203.0.113.7:51234'), '203.0.113.7');
  assert.strictEqual(clientIp('203.0.113.7, 10.0.0.1'), '203.0.113.7');
  assert.strictEqual(clientIp('[2001:db8::1]:443'), '2001:db8::1');
  assert.strictEqual(clientIp('2001:db8::1'), '2001:db8::1');
  assert.strictEqual(clientIp(undefined), null);
});

test('visitorId is stable within a day and changes the next day', () => {
  const d1 = new Date('2026-09-29T01:00:00Z');
  const d1later = new Date('2026-09-29T23:00:00Z');
  const d2 = new Date('2026-09-30T01:00:00Z');
  assert.strictEqual(visitorId('1.2.3.4', 's', d1), visitorId('1.2.3.4', 's', d1later));
  assert.notStrictEqual(visitorId('1.2.3.4', 's', d1), visitorId('1.2.3.4', 's', d2));
});

test('visitorId never contains the raw IP and needs a salt', () => {
  assert.ok(!visitorId('1.2.3.4', 's').includes('1.2.3.4'));
  assert.throws(() => visitorId('1.2.3.4', ''));
});