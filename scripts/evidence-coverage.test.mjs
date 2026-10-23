import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coverageHandoff, validateEvidenceCoverage } from './evidence-coverage.mjs';
import { validateVerificationBatch, verificationAllows } from './qa-verification-batch.mjs';

const item = () => ({ outcome: 'Passed', evidence: ['criterion-1-final.png'], coverageChecks: [
  { assertion: 'Required last field is readable', outcome: 'Passed', evidence: ['criterion-1-final.png'] }
] });

test('new testing and review handoffs require coverage; other stages and identities unchanged', () => {
  assert.equal(coverageHandoff(null), null);
  for (const action of ['test_ticket', 'evidence_review']) {
    const h = { action, handoffId: 'same', handoffVersion: 'same', cycleId: 'cycle-002', attempt: 1 };
    assert.deepEqual(coverageHandoff(h), { ...h, evidenceCoverageVersion: 1 });
  }
  const h = { action: 'criteria_conversion' };
  assert.equal(coverageHandoff(h), h);
});

test('legacy records remain supported, but marked handoffs cannot omit coverage', () => {
  validateEvidenceCoverage([{ outcome: 'Passed' }]);
  assert.throws(() => validateEvidenceCoverage([{ outcome: 'Passed' }], { required: true }), /coverageChecks/);
  validateEvidenceCoverage([item()], { required: true });
});

test('declared missing branch cannot coexist with an overall criterion pass', () => {
  for (const outcome of ['Blocked', 'Failed', 'Unverified']) {
    const value = item(); value.coverageChecks.push({ assertion: 'All columns sorted', outcome,
      evidence: outcome === 'Failed' ? value.evidence : [] });
    assert.throws(() => validateEvidenceCoverage([value]), new RegExp(`must be ${outcome}`));
    value.outcome = outcome; validateEvidenceCoverage([value]);
  }
});

test('coverage forbids duplicate assertions, unknown outcomes and unsupported evidence', () => {
  for (const mutate of [
    x => { x.coverageChecks = []; },
    x => { x.coverageChecks.push({ ...x.coverageChecks[0], assertion: ' Required last field is readable ' }); },
    x => { x.coverageChecks[0].outcome = 'OK'; },
    x => { x.coverageChecks[0].assertion = ''; },
    x => { x.coverageChecks[0].evidence = []; },
    x => { x.coverageChecks[0].evidence = ['criterion-2-final.png']; }
  ]) { const value = item(); mutate(value); assert.throws(() => validateEvidenceCoverage([value])); }
});

test('review keeps every tester assertion and references only its own result proof', () => {
  const source = item(), review = item(); delete review.evidence;
  validateEvidenceCoverage([review], { required: true, results: [source] });
  review.coverageChecks[0].assertion = 'Different assertion';
  assert.throws(() => validateEvidenceCoverage([review], { results: [source] }), /omitted/);
  review.coverageChecks = source.coverageChecks.map(x => ({ ...x, evidence: ['other.png'] }));
  assert.throws(() => validateEvidenceCoverage([review], { results: [source] }), /outside/);
});

test('review may add omitted branches and independently downgrade tester proof', () => {
  const source = item(), review = item();
  review.coverageChecks.push({ assertion: 'First field is readable', outcome: 'Unverified', evidence: [] });
  review.outcome = 'Unverified';
  validateEvidenceCoverage([review], { required: true, results: [source] });
  validateEvidenceCoverage([review], { required: true, results: [{ evidence: source.evidence }] });
});

test('verification policy holds test/review work but never mutates unrelated work', () => {
  const policy = { enabled: true, maxReleased: 2, released: ['TEST2-79', 'TEST2-89'], held: ['TEST2-80'] };
  validateVerificationBatch(policy);
  for (const action of ['test_ticket', 'evidence_review']) {
    assert.equal(verificationAllows({ ticket: 'TEST2-80', action }, policy), false);
    assert.equal(verificationAllows({ ticket: 'TEST2-79', action }, policy), true);
    assert.equal(verificationAllows({ ticket: 'TEST2-99', action }, policy), true);
  }
  assert.equal(verificationAllows({ ticket: 'TEST2-80', action: 'criteria_conversion' }, policy), true);
  assert.equal(verificationAllows({ ticket: 'TEST2-80', action: 'test_ticket' }, null), true);
  assert.throws(() => validateVerificationBatch({ ...policy, released: [...policy.released, 'TEST2-81'] }));
  assert.throws(() => validateVerificationBatch({ ...policy, held: ['TEST2-79'] }));
});
