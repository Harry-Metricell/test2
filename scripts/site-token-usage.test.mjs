import { test } from 'node:test';
import assert from 'node:assert/strict';
import { siteTokenUsage } from './site-token-usage.mjs';
const record = (id = '01a1a720-5560-7652-8a33-ab6a0ab97c45') => ({
  threadId: id, ticket: 'TEST2-90', handoffId: 'handoff-TEST2-90-cycle-005-test-attempt-001', role: 'qa-testing',
  status: 'measured', usage: { input_tokens: 100, cached_input_tokens: 80, output_tokens: 10, reasoning_output_tokens: 4, total_tokens: 110 },
  observedAt: '2026-11-04T12:00:00Z', credentials: 'SECRET', content: 'PRIVATE_SCREENSHOT',
});
const project = sessions => siteTokenUsage({ schema: 'test2-local-token-usage.v1', days: 14, sessions, secret: 'DO_NOT_COPY' });

test('public projection sums each thread once and excludes all private identifiers/content', () => {
  const data = project([record(), record()]);
  assert.equal(data.tickets['TEST2-90'].measuredChats, 1);
  assert.equal(data.tickets['TEST2-90'].roles['qa-testing'].total_tokens, 110);
  assert.doesNotMatch(JSON.stringify(data), /SECRET|PRIVATE|DO_NOT_COPY|01a1a720|handoff-|credentials|content/);
  assert.equal(data.coverage, 'partial'); assert.equal(data.includesCoordinator, false);
});
test('unknown usage is counted as unavailable, never as zero-cost or inferred credits', () => {
  const r = record(); r.status = 'fork_baseline_unavailable'; r.usage = null;
  const t = project([r]).tickets['TEST2-90'];
  assert.equal(t.measuredChats, 0); assert.equal(t.unavailableChats, 1);
});
test('coordinator overhead, unrelated tickets, invalid counts and mismatched handoffs are not assigned', () => {
  assert.deepEqual(project([{ ...record(), role: 'coordinator' }]).tickets, {});
  assert.deepEqual(project([{ ...record(), ticket: '../SECRET' }]).tickets, {});
  assert.deepEqual(project([{ ...record(), handoffId: 'handoff-TEST2-91-test' }]).tickets, {});
  const bad = record(); bad.usage.input_tokens = -1;
  assert.equal(project([bad]).tickets['TEST2-90'].unavailableChats, 1);
  assert.throws(() => siteTokenUsage({}));
});
