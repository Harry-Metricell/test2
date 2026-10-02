import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reconcilePublishedTests } from './reconcile-coordinator-tests.mjs';

const record = { ticket: 'TEST2-50', stage: 'test_ticket', handoffId: 'handoff-TEST2-50-test-attempt-001', childTaskId: 'unavailable-task', lastObservedState: 'task_query_unavailable' };
const output = { ticket: record.ticket, handoffId: record.handoffId, results: [{ outcome: 'Passed' }] };
test('published exact tester history plus advanced queue retires unavailable task tracking', () => {
  const result = reconcilePublishedTests({ active: [record] }, [{ handoffId: 'review-50' }], () => [output]);
  assert.deepEqual(result.retired, [record.handoffId]);
  assert.deepEqual(result.state.active, []);
});
test('same live handoff is retained while propagation remains unresolved', () => {
  assert.deepEqual(reconcilePublishedTests({ active: [record] }, [record], () => [output]).state.active, [record]);
});
test('old history, no-op or empty history cannot satisfy current attempt', () => {
  for (const value of [{ ...output, handoffId: 'previous-attempt' }, { ...output, noOp: true }, { ...output, results: [] }, { ...output, ticket: 'TEST2-49' }]) {
    assert.deepEqual(reconcilePublishedTests({ active: [record] }, [], () => [value]).state.active, [record]);
  }
});
test('unresolved tasks and other stages remain untouched', () => {
  const other = { ...record, stage: 'evidence_review' };
  assert.deepEqual(reconcilePublishedTests({ active: [record, other] }, [], () => []).state.active, [record, other]);
});
test('missing or malformed remote queue fails closed', () => {
  assert.throws(() => reconcilePublishedTests({ active: [record] }, undefined, () => [output]));
});
