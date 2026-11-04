import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { usageRecord, collectUsage } from './qa-token-usage.mjs';

const thread = '01a1a720-5560-7652-8a33-ab6a0ab97c45';
const handoff = 'handoff-TEST2-90-cycle-005-review-attempt-001';
const totals = n => ({ input_tokens: n, cached_input_tokens: n - 2, output_tokens: 8, reasoning_output_tokens: 3, total_tokens: n + 8 });
const meta = cwd => ({ type: 'session_meta', payload: { id: thread, cwd } });
const launch = (brief = 'evidence-review', id = handoff) => ({ type: 'response_item', payload: { role: 'user', content: [{ text: `read and follow: docs/briefs/${brief}.md for handoff ${id} (TEST2-90)` }] } });
const count = (n, timestamp = '2026-11-04T10:00:00Z') => ({ type: 'event_msg', timestamp, payload: { type: 'token_count', info: { total_token_usage: totals(n) } } });

test('latest cumulative counters are used once without adding cached or reasoning twice', () => {
  const record = usageRecord([meta('/qa'), launch(), count(10), count(10), count(20)], ['/qa']);
  assert.deepEqual(record.usage, totals(20));
  assert.equal(record.ticket, 'TEST2-90');
  assert.equal(record.role, 'evidence-review');
  assert.equal(record.status, 'measured');
});

test('missing counters, resets and inherited fork totals cannot become valid zero/full charges', () => {
  assert.equal(usageRecord([meta('/qa'), launch()], ['/qa']).status, 'usage_unavailable');
  assert.equal(usageRecord([meta('/qa'), launch(), count(20), count(10)], ['/qa']).usage, null);
  const fork = meta('/qa'); fork.payload.parent_thread_id = thread;
  assert.equal(usageRecord([fork, launch(), count(20)], ['/qa']).status, 'fork_baseline_unavailable');
  const invalid = count(10); invalid.payload.info.total_token_usage.cached_input_tokens = 200;
  assert.equal(usageRecord([meta('/qa'), launch(), invalid], ['/qa']).usage, null);
});

test('other projects, incidental mentions and multi-handoff chats are excluded', () => {
  assert.equal(usageRecord([meta('/unrelated'), launch(), count(10)], ['/qa']), null);
  assert.equal(usageRecord([meta('/qa'), { type: 'event_msg', payload: { type: 'user_message', message: 'Discuss TEST2-90' } }, count(10)], ['/qa']), null);
  assert.equal(usageRecord([meta('/qa'), launch(), launch('qa-testing'), count(10)], ['/qa']), null);
});

test('exact coordinator child identity can attribute a worker without a visible launch prompt', () => {
  const bindings = { [thread]: { role: 'evidence-review', handoffId: handoff } };
  const record = usageRecord([meta('/qa'), count(20)], ['/qa'], bindings);
  assert.equal(record.ticket, 'TEST2-90');
  assert.equal(record.role, 'evidence-review');
  assert.equal(usageRecord([meta('/other'), count(20)], ['/qa'], bindings), null);
});

test('collector is repeatable, deduplicates session files and stores counters without private text', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-usage-'));
  try {
    const repo = path.join(base, 'repo'), logs = path.join(base, 'sessions');
    const folder = path.join(logs, '2026', '11', '04'); fs.mkdirSync(folder, { recursive: true });
    const events = [meta(repo), launch(), { type: 'response_item', payload: { role: 'assistant', content: [{ text: 'SECRET_PASSWORD private screenshot' }] } }, count(20)];
    const file = path.join(folder, 'rollout-a.jsonl');
    fs.writeFileSync(file, events.map(e => JSON.stringify(e)).join('\n') + '\n{"partial":');
    fs.copyFileSync(file, path.join(folder, 'rollout-b.jsonl'));
    const options = { repo, sessionsRoot: logs, roots: [repo], now: new Date('2026-11-04T12:00:00Z') };
    for (let i = 0; i < 2; i++) {
      assert.equal(collectUsage(options).measuredSessions, 1);
      const summary = JSON.parse(fs.readFileSync(path.join(repo, '.agent-staging/usage/summary.json')));
      assert.equal(summary.totalsByRole['evidence-review'].total_tokens, 28);
      assert.equal(summary.complete, false);
    }
    fs.appendFileSync(file, '\n' + JSON.stringify(count(50, '2026-11-04T11:00:00Z')) + '\n');
    collectUsage(options);
    const summary = JSON.parse(fs.readFileSync(path.join(repo, '.agent-staging/usage/summary.json')));
    assert.equal(summary.totalsByRole['evidence-review'].total_tokens, 58);
    for (const name of ['cache.json', 'summary.json']) assert.doesNotMatch(fs.readFileSync(path.join(repo, '.agent-staging/usage', name), 'utf8'), /SECRET_PASSWORD|private screenshot|read and follow/);
  } finally { fs.rmSync(base, { recursive: true, force: true }); }
});

test('missing session directory is an incomplete observation, not measured zero use', () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-usage-empty-'));
  try {
    collectUsage({ repo, sessionsRoot: path.join(repo, 'absent') });
    const summary = JSON.parse(fs.readFileSync(path.join(repo, '.agent-staging/usage/summary.json')));
    assert.equal(summary.complete, false);
    assert.deepEqual(summary.totalsByRole, {});
  } finally { fs.rmSync(repo, { recursive: true, force: true }); }
});

test('worker identity survives retirement from active run state without copying bookkeeping secrets', () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-usage-worker-'));
  try {
    const logs = path.join(repo, 'sessions'), folder = path.join(logs, '2026', '11', '04');
    fs.mkdirSync(folder, { recursive: true });
    const staging = path.join(repo, '.agent-staging'); fs.mkdirSync(staging);
    const statePath = path.join(staging, 'coordinator-run-state.json');
    fs.writeFileSync(statePath, JSON.stringify({ active: [{ childTaskId: thread, stage: 'evidence_review', handoffId: handoff, secret: 'DO_NOT_COPY' }] }));
    fs.writeFileSync(path.join(folder, 'rollout-worker.jsonl'), [meta(repo), count(20)].map(e => JSON.stringify(e)).join('\n') + '\n');
    const options = { repo, sessionsRoot: logs, now: new Date('2026-11-04T12:00:00Z') };
    assert.equal(collectUsage(options).measuredSessions, 1);
    fs.writeFileSync(statePath, JSON.stringify({ active: [] }));
    assert.equal(collectUsage(options).measuredSessions, 1);
    const registry = fs.readFileSync(path.join(staging, 'usage/threads.json'), 'utf8');
    assert.doesNotMatch(registry, /DO_NOT_COPY/);
    assert.equal(JSON.parse(registry)[thread].handoffId, handoff);
  } finally { fs.rmSync(repo, { recursive: true, force: true }); }
});
