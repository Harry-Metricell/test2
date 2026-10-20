import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scopeHandoff, evidenceBase, readCycle, publicationStillCurrent, latestGuideRecord } from './testing-cycle.mjs';
import { fetchJiraSnapshot } from './fetch-jira.mjs';
import { acquireLease, releaseLease } from './tester-browser-lease.mjs';

const importer = fileURLToPath(new URL('./sync-ticket-folders.mjs', import.meta.url));
const generator = fileURLToPath(new URL('./generate-status.mjs', import.meta.url));
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-cycle-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const dir = path.join(root, 'tickets', 'TEST2-99');
  const write = (name, value) => { const f = path.join(dir, name); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, typeof value === 'string' ? value : JSON.stringify(value)); };
  const issue = (status = 'READY FOR TESTING', transitions = [], description = 'Acceptance Criteria:\nThe layer is visible.') => ({ key: 'TEST2-99', fields: { summary: 'A layer', description, project: { key: 'TEST2' }, status: { name: status }, updated: transitions.at(-1)?.at || '2026-10-19T10:00:00Z' }, qaStatusHistory: { complete: true, transitions } });
  const run = value => { fs.writeFileSync(path.join(root, 'results.json'), JSON.stringify({ issues: [value], isLast: true })); execFileSync(process.execPath, [importer], { cwd: root }); execFileSync(process.execPath, [generator], { cwd: root }); };
  const seed = () => {
    run(issue());
    write('status.json', { criteriaVerified: true, qaStatus: 'Blocked', retries: 1, testAttempts: 2 });
    write('criteria.md', '- [ ] The layer is visible.\n');
    for (const n of [1, 2]) write(`history/attempt-00${n}-test.json`, { historyAttempt: n, ticket: 'TEST2-99', handoffId: `handoff-TEST2-99-test-attempt-00${n}`, results: [{ criterion: 1, outcome: 'Blocked', retryClass: 'prerequisite' }] });
    write('results.json', [{ criterion: 'The layer is visible.', outcome: 'Blocked' }]);
    write('review.json', { historyAttempt: 2, overallOutcome: 'Blocked' });
    write('report.pdf', 'old report bytes');
    write('retry-request.json', { schema: 'old request' });
  };
  const events = [{ id: '10:0', at: '2026-10-20T10:00:00Z', from: 'READY FOR TESTING', to: 'To Do' }, { id: '11:0', at: '2026-10-20T10:01:00Z', from: 'To Do', to: 'READY FOR TESTING' }];
  return { root, dir, write, issue, run, seed, events, queue: () => JSON.parse(fs.readFileSync(path.join(root, 'status/handoffs.json'))).handoffs };
}

test('rapid rework/return starts a fresh cycle and preserves reports, criteria and history', t => {
  const f = fixture(t); f.seed();
  f.run(f.issue('READY FOR TESTING', f.events));
  assert.equal(readCycle(f.dir).cycleId, 'cycle-002');
  assert.equal(fs.readFileSync(path.join(f.dir, 'cycles/cycle-001/report.pdf'), 'utf8'), 'old report bytes');
  assert.ok(fs.existsSync(path.join(f.dir, 'cycles/cycle-001/history/attempt-002-test.json')));
  assert.ok(fs.existsSync(path.join(f.dir, 'cycles/cycle-001/retry-request.json')));
  assert.equal(fs.existsSync(path.join(f.dir, 'history')), false);
  const status = JSON.parse(fs.readFileSync(path.join(f.dir, 'status.json')));
  assert.equal(status.retries, 0); assert.equal(status.testAttempts, 0); assert.equal(status.criteriaVerified, true);
  assert.equal(f.queue()[0].handoffId, 'handoff-TEST2-99-cycle-002-test-attempt-001');
  assert.equal(f.queue()[0].inputs.evidenceFolder, 'TEST2-99/cycles/cycle-002/screenshots/attempt-001');
  f.run(f.issue('READY FOR TESTING', f.events));
  assert.equal(readCycle(f.dir).cycleId, 'cycle-002');
  assert.equal(f.queue()[0].attempt, 1);
  f.write('history/attempt-001-test.json', { historyAttempt: 1, results: [{ criterion: 1, outcome: 'Blocked', retryClass: 'transient' }] });
  f.write('results.json', [{ criterion: 'The layer is visible.', outcome: 'Blocked' }]);
  f.run(f.issue('READY FOR TESTING', f.events));
  assert.equal(f.queue()[0].handoffId, 'handoff-TEST2-99-cycle-002-retry-attempt-002');
  f.write('history/attempt-002-test.json', { historyAttempt: 2, results: [{ criterion: 1, outcome: 'Blocked', retryClass: 'transient' }] });
  f.run(f.issue('READY FOR TESTING', f.events));
  assert.equal(f.queue()[0].action, 'evidence_review');
  assert.equal(f.queue()[0].attempt, 2);
});

test('separately imported To Do waits; changed source requires criteria checking on return', t => {
  const f = fixture(t); f.seed();
  f.run(f.issue('To Do', f.events.slice(0, 1)));
  assert.equal(readCycle(f.dir).cycleId, 'cycle-001'); assert.equal(f.queue().length, 0);
  f.run(f.issue('READY FOR TESTING', f.events, 'Acceptance Criteria:\nThe revised layer is visible.'));
  assert.equal(readCycle(f.dir).cycleId, 'cycle-002');
  assert.equal(f.queue()[0].action, 'criteria_conversion');
  assert.equal(fs.existsSync(path.join(f.dir, 'criteria.md')) && fs.readFileSync(path.join(f.dir, 'criteria.md'), 'utf8').includes('revised'), true);
});

test('deployment, ordinary updates, and testing-in-progress do not reset attempts', t => {
  const f = fixture(t); f.seed();
  fs.rmSync(path.join(f.dir, 'qa-cycle.json'));
  const old = [{ id: '1:0', at: '2026-10-18T10:00:00Z', to: 'To Do' }, { id: '2:0', at: '2026-10-18T11:00:00Z', to: 'READY FOR TESTING' }];
  f.run(f.issue('READY FOR TESTING', old));
  assert.equal(readCycle(f.dir).cycleId, 'cycle-001');
  const busy = [...old, { id: '3:0', at: '2026-10-20T10:00:00Z', to: 'TESTING IN PROGRESS' }, { id: '4:0', at: '2026-10-20T11:00:00Z', to: 'READY FOR TESTING' }];
  f.run(f.issue('READY FOR TESTING', busy, 'Updated wording'));
  assert.equal(readCycle(f.dir).cycleId, 'cycle-001');
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.dir, 'status.json'))).testAttempts, 2);
});

test('cycle handoffs and browser leases have distinct identities', t => {
  const f = fixture(t);
  const h = { ticket: 'TEST2-99', handoffId: 'handoff-TEST2-99-test-attempt-001', handoffVersion: 'TEST2-99:test_ticket:1', attempt: 1, inputs: {} };
  const next = scopeHandoff(h, 'cycle-002');
  assert.notEqual(h.handoffVersion, next.handoffVersion);
  assert.equal(evidenceBase(h.ticket, 'cycle-001'), 'TEST2-99');
  assert.equal(evidenceBase(h.ticket, 'cycle-002'), 'TEST2-99/cycles/cycle-002');
  const lease = acquireLease(f.root, next.handoffId);
  assert.equal(lease.acquired, true); releaseLease(f.root, next.handoffId, lease.token);
});

test('publication rechecks reject an old cycle even while its old queue is visible', t => {
  const f = fixture(t); f.seed();
  const handoff = { ticket: 'TEST2-99', handoffId: 'handoff-TEST2-99-test-attempt-001', handoffVersion: 'TEST2-99:test_ticket:1', action: 'test_ticket' };
  fs.writeFileSync(path.join(f.root, 'status/handoffs.json'), JSON.stringify({ handoffs: [handoff] }));
  assert.equal(publicationStillCurrent(f.root, handoff, 'cycle-001', 'test_ticket'), true);
  f.write('qa-cycle.json', { cycleId: 'cycle-002' });
  assert.equal(publicationStillCurrent(f.root, handoff, 'cycle-001', 'test_ticket'), false);
  const next = scopeHandoff(handoff, 'cycle-002');
  fs.writeFileSync(path.join(f.root, 'status/handoffs.json'), JSON.stringify({ handoffs: [next] }));
  assert.equal(publicationStillCurrent(f.root, next, 'cycle-002', 'test_ticket'), true);
  assert.equal(publicationStillCurrent(f.root, handoff, 'cycle-002', 'test_ticket'), false);
  f.write('cycles/cycle-001/guide-update.json', { title: 'Existing instructions' });
  assert.equal(latestGuideRecord(f.root, 'TEST2-99'), path.join(f.dir, 'cycles/cycle-001/guide-update.json'));
});

test('Done/reopen preserves old artifacts and starts one new cycle', t => {
  const f = fixture(t); f.seed();
  const doneEvents = [{ ...f.events[0], to: 'Done' }];
  f.run(f.issue('Done', doneEvents));
  assert.ok(fs.existsSync(path.join(f.root, 'archive/tickets/TEST2-99/report.pdf')));
  f.run(f.issue('READY FOR TESTING', [...doneEvents, f.events[1]]));
  assert.equal(readCycle(f.dir).cycleId, 'cycle-002');
  assert.equal(f.queue()[0].attempt, 1);
});

test('Jira search and changelog pagination are complete; failures cannot become snapshots', async t => {
  const f = fixture(t); let calls = 0;
  const result = await fetchJiraSnapshot({ base: 'https://jira.example', project: 'TEST2', authorization: 'fake', root: f.root, request: async url => {
    calls++; const parsed = new URL(url);
    const data = parsed.pathname.endsWith('search/jql') ? { issues: [f.issue('READY FOR TESTING', f.events)], isLast: true }
      : parsed.searchParams.get('startAt') === '0' ? { startAt: 0, total: 2, values: [{ id: '10', created: f.events[0].at, items: [{ fieldId: 'status', fromString: 'READY FOR TESTING', toString: 'To Do' }] }] }
      : { startAt: 1, total: 2, values: [{ id: '11', created: f.events[1].at, items: [{ field: 'status', fromString: 'To Do', toString: 'READY FOR TESTING' }] }] };
    return { ok: true, json: async () => data };
  } });
  assert.equal(calls, 3); assert.equal(result.issues[0].qaStatusHistory.transitions.length, 2); assert.equal(result.isLast, true);
  await assert.rejects(fetchJiraSnapshot({ base: 'https://jira.example', project: 'TEST2', authorization: 'fake', request: async () => ({ ok: false, status: 403 }) }), /HTTP 403/);
  await assert.rejects(fetchJiraSnapshot({ base: 'https://jira.example', project: 'TEST2', authorization: 'fake', request: async () => ({ ok: true, json: async () => ({ issues: [], isLast: false }) }) }), /pagination/);
});

test('all Jira search pages are read; unchanged history is reused and Done needs no changelog', async t => {
  const f = fixture(t); f.run(f.issue());
  let calls = 0;
  const snapshot = await fetchJiraSnapshot({ base: 'https://jira.example', project: 'TEST2', authorization: 'fake', root: f.root, request: async url => {
    calls++; const parsed = new URL(url);
    assert.ok(parsed.pathname.endsWith('search/jql'));
    const page = parsed.searchParams.has('nextPageToken')
      ? { issues: [{ key: 'TEST2-100', fields: { status: { name: 'Done' } } }], isLast: true }
      : { issues: [f.issue()], isLast: false, nextPageToken: 'next' };
    return { ok: true, json: async () => page };
  } });
  assert.equal(snapshot.issues.length, 2); assert.equal(calls, 2);
});
