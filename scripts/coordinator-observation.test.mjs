import { test } from 'node:test';
import assert from 'node:assert/strict';
import { observeCoordinator } from './coordinator-observation.mjs';
const handoffId = 'handoff-TEST2-89-cycle-005-test-attempt-001';
const state = { active: [{ ticket: 'TEST2-89', handoffId, token: 'SECRET' }] };
const checkpoint = { handoffId, completedResults: [{ outcome: 'Passed', evidence: ['PRIVATE'], reason: 'SECRET' }], currentCriterion: 2, token: 'SECRET', currentUrl: 'PRIVATE' };

test('unchanged checkpoints suppress payload despite timestamps and commentary', () => {
  const first = observeCoordinator(state, () => checkpoint);
  assert.equal(first.active[0].completed, 1);
  const next = observeCoordinator(state, () => ({ ...checkpoint, updatedAt: 'later', commentary: 'different' }), first.digest);
  assert.deepEqual(next, { changed: false, digest: first.digest });
  assert.doesNotMatch(JSON.stringify(first), /SECRET|PRIVATE|currentUrl|evidence/);
});
test('criterion completion, missing checkpoints and active membership change the digest', () => {
  const first = observeCoordinator(state, () => checkpoint);
  assert.equal(observeCoordinator(state, () => ({ ...checkpoint, completedResults: [...checkpoint.completedResults, { outcome: 'Blocked' }] }), first.digest).changed, true);
  assert.equal(observeCoordinator(state, () => null, first.digest).active[0].checkpoint, 'absent');
  assert.equal(observeCoordinator({ active: [] }, () => null, first.digest).changed, true);
});
test('malformed input and read errors cannot become empty or successful observations', () => {
  assert.throws(() => observeCoordinator({}, () => null));
  assert.throws(() => observeCoordinator(state, () => { throw new Error('permission denied'); }));
  assert.throws(() => observeCoordinator(state, () => ({ ...checkpoint, handoffId: 'other' })));
  assert.throws(() => observeCoordinator(state, () => ({ ...checkpoint, completedResults: [{ outcome: 'Fine' }] })));
  assert.throws(() => observeCoordinator({ active: [{ ticket: 'TEST2-89', handoffId: '../escape' }] }, () => null));
});
