import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { reconcilePublishedTests, validateRecoverySnapshot } from './reconcile-coordinator-tests.mjs';

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

test('connector recovery accepts only fresh pinned snapshots with complete history and successful bundler', () => {
  const now = Date.parse('2026-10-05T10:00:00Z');
  const snapshot = { schema: 'v4-qa-recovery-snapshot.v1', commit: 'a'.repeat(40), fetchedAt: new Date(now).toISOString(), bundlerSucceeded: true, handoffs: [], histories: { 'TEST2-50': [output] } };
  assert.equal(validateRecoverySnapshot(snapshot, now), snapshot);
  for (const changed of [{ commit: 'main' }, { fetchedAt: 'invalid' }, { fetchedAt: '2026-10-05T09:50:00Z' }, { bundlerSucceeded: false }, { handoffs: null }, { histories: [] }, { histories: { 'TEST2-50': null } }]) {
    assert.throws(() => validateRecoverySnapshot({ ...snapshot, ...changed }, now));
  }
});

test('connector CLI reconciles without Git and backs up only local operational state', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-recovery-'));
  try {
    const statePath = path.join(root, 'state.json');
    const snapshotPath = path.join(root, 'snapshot.json');
    fs.writeFileSync(statePath, JSON.stringify({ active: [record] }));
    fs.writeFileSync(snapshotPath, JSON.stringify({ schema: 'v4-qa-recovery-snapshot.v1', commit: 'a'.repeat(40), fetchedAt: new Date().toISOString(), bundlerSucceeded: true, handoffs: [], histories: { 'TEST2-50': [output] } }));
    const script = fileURLToPath(new URL('./reconcile-coordinator-tests.mjs', import.meta.url));
    const result = JSON.parse(execFileSync(process.execPath, [script, '--state', statePath, '--snapshot', snapshotPath, '--apply'], {
      encoding: 'utf8', windowsHide: true, env: { ...process.env, TEST2_GIT: path.join(root, 'git-does-not-exist') }
    }));
    assert.deepEqual(result.retired, [record.handoffId]);
    assert.deepEqual(JSON.parse(fs.readFileSync(statePath, 'utf8')).active, []);
    const backup = fs.readdirSync(root).find(file => file.startsWith('state.json.before-reconcile-'));
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, backup), 'utf8')).active, [record]);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
