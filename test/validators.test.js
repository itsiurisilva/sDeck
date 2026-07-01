import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  generatePin,
  isValidPin,
  isLocalRequest,
  isValidProfile,
  isValidProfilesPayload
} from '../lib/validators.js';

describe('generatePin', () => {
  test('produces a 6-digit numeric string', () => {
    const pin = generatePin();
    assert.match(pin, /^\d{6}$/);
  });

  test('does not always produce the same value', () => {
    const pins = new Set(Array.from({ length: 20 }, generatePin));
    assert.ok(pins.size > 1);
  });
});

describe('isValidPin', () => {
  test('accepts a matching pin', () => {
    assert.equal(isValidPin('123456', '123456'), true);
  });

  test('rejects a mismatched pin', () => {
    assert.equal(isValidPin('111111', '123456'), false);
  });

  test('rejects empty/missing input', () => {
    assert.equal(isValidPin('', '123456'), false);
    assert.equal(isValidPin(null, '123456'), false);
    assert.equal(isValidPin(undefined, '123456'), false);
  });
});

describe('isLocalRequest', () => {
  test('treats loopback addresses as local', () => {
    assert.equal(isLocalRequest({ socket: { remoteAddress: '127.0.0.1' } }), true);
    assert.equal(isLocalRequest({ socket: { remoteAddress: '::1' } }), true);
    assert.equal(isLocalRequest({ socket: { remoteAddress: '::ffff:127.0.0.1' } }), true);
  });

  test('treats LAN addresses as non-local', () => {
    assert.equal(isLocalRequest({ socket: { remoteAddress: '192.168.1.42' } }), false);
  });
});

describe('isValidProfile', () => {
  test('accepts a well-formed profile', () => {
    assert.equal(isValidProfile({ rows: 4, cols: 10, buttons: {} }), true);
  });

  test('rejects missing/invalid rows or cols', () => {
    assert.equal(isValidProfile({ rows: 0, cols: 10, buttons: {} }), false);
    assert.equal(isValidProfile({ rows: 4, cols: '10', buttons: {} }), false);
    assert.equal(isValidProfile({ cols: 10, buttons: {} }), false);
  });

  test('rejects non-object buttons', () => {
    assert.equal(isValidProfile({ rows: 4, cols: 10, buttons: [] }), false);
    assert.equal(isValidProfile({ rows: 4, cols: 10, buttons: null }), false);
  });

  test('rejects non-object profiles', () => {
    assert.equal(isValidProfile(null), false);
    assert.equal(isValidProfile('profile'), false);
  });
});

describe('isValidProfilesPayload', () => {
  test('accepts a map of valid profiles', () => {
    const payload = {
      obs_control: { rows: 3, cols: 5, buttons: {} },
      gaming: { rows: 2, cols: 4, buttons: { '0-0': { label: 'A' } } }
    };
    assert.equal(isValidProfilesPayload(payload), true);
  });

  test('rejects if any profile in the map is malformed', () => {
    const payload = {
      obs_control: { rows: 3, cols: 5, buttons: {} },
      broken: { rows: -1, cols: 5, buttons: {} }
    };
    assert.equal(isValidProfilesPayload(payload), false);
  });

  test('rejects empty, non-object, or array payloads', () => {
    assert.equal(isValidProfilesPayload({}), false);
    assert.equal(isValidProfilesPayload(null), false);
    assert.equal(isValidProfilesPayload([]), false);
    assert.equal(isValidProfilesPayload('nope'), false);
  });
});
