import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { acquireLease, releaseLease, leaseStatus } from './tester-browser-lease.mjs';

test('only one tester can own the browser, including duplicate handoffs', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-browser-lease-'));
  try {
    const owner = acquireLease(root, 'handoff-TEST2-79-test-attempt-001');
    assert.equal(owner.acquired, true);
    assert.equal(acquireLease(root, owner.handoffId).acquired, false);
    assert.equal(acquireLease(root, 'handoff-TEST2-80-test-attempt-001').acquired, false);
    assert.throws(() => releaseLease(root, 'handoff-TEST2-80-test-attempt-001', owner.token), /another tester/);
    assert.throws(() => releaseLease(root, owner.handoffId, 'wrong'), /another tester/);
    assert.equal(leaseStatus(root).handoffId, owner.handoffId);
    releaseLease(root, owner.handoffId, owner.token);
    assert.deepEqual(leaseStatus(root), { busy: false });
    assert.equal(acquireLease(root, 'handoff-TEST2-85-retry-attempt-002').acquired, true);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('old or incomplete leases never expire into overlapping browser tests', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-browser-lease-'));
  try {
    fs.mkdirSync(path.join(root, 'tester-browser.lock'));
    assert.equal(acquireLease(root, 'handoff-TEST2-80-test-attempt-001').acquired, false);
    fs.writeFileSync(path.join(root, 'tester-browser.lock/owner.json'), JSON.stringify({ handoffId: 'handoff-TEST2-79-test-attempt-001', token: 'original', acquiredAt: '2000-01-01' }));
    assert.equal(acquireLease(root, 'handoff-TEST2-80-test-attempt-001').acquired, false);
    assert.throws(() => acquireLease(root, '../outside'), /valid tester/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
