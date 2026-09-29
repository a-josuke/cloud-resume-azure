const { test } = require('node:test');
const assert = require('node:assert/strict');
const { nextCount } = require('../src/counter');

test('starts at 1 when there is no item yet', () => {
  assert.equal(nextCount(undefined), 1);
});

test('adds 1 to the stored count', () => {
  assert.equal(nextCount({ id: 'visitors', count: 5 }), 6);
});

test('treats a bad stored value as 0', () => {
  assert.equal(nextCount({ id: 'visitors', count: 'abc' }), 1);
});