import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const generator = fileURLToPath(new URL('./generate-status.mjs', import.meta.url));

test('post-import criteria check does not race the status bundler', () => {
  const workflows = fileURLToPath(new URL('../.github/workflows/', import.meta.url));
  const criteria = fs.readFileSync(path.join(workflows, 'check-criteria.yml'), 'utf8');
  const bundler = fs.readFileSync(path.join(workflows, 'status-bundler.yml'), 'utf8');
  const consistency = fs.readFileSync(path.join(workflows, 'status-consistency.yml'), 'utf8');
  assert.match(criteria, /node scripts\/check-criteria\.mjs/);
  assert.doesNotMatch(criteria, /node scripts\/generate-status\.mjs --check/);
  assert.match(bundler, /run: node scripts\/generate-status\.mjs/);
  assert.match(consistency, /run: node scripts\/generate-status\.mjs/);
  assert.match(consistency, /git diff --exit-code -- status tickets/);
});

test('Jira imports and bundling preserve worker-approved criteria', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-criteria-preservation-'));
  const ticketDir = path.join(root, 'tickets', 'TEST2-99');
  const criteriaFile = path.join(ticketDir, 'criteria.md');
  const ticketFile = path.join(ticketDir, 'ticket.json');
  const writeTicket = (wording) => fs.writeFileSync(ticketFile, JSON.stringify({
    key: 'TEST2-99', fields: {
      summary: 'Check GIS zoom', created: '2026-09-25T00:00:00Z',
      status: { name: 'READY FOR TESTING' }, project: { key: 'TEST2' },
      description: `Acceptance Criteria:\n${wording}`
    }
  }));
  const generate = () => execFileSync(process.execPath, [generator], { cwd: root, encoding: 'utf8' });
  try {
    fs.mkdirSync(ticketDir, { recursive: true });
    writeTicket('Selecting zoom in changes the map.');
    generate();
    assert.match(fs.readFileSync(criteriaFile, 'utf8'), /Selecting zoom in/);
    const approved = '<!-- Converted from the complete Jira ticket source. -->\n\n- [ ] On the loaded GIS map, selecting Zoom in changes its scale.\n';
    fs.writeFileSync(criteriaFile, approved);
    fs.writeFileSync(path.join(ticketDir, 'status.json'), JSON.stringify({ ticket: 'TEST2-99', jiraStatus: 'READY FOR TESTING', qaStatus: 'Ready for Testing', criteriaVerified: true, retries: 0, retryLimit: 3 }));
    writeTicket('Selecting zoom out changes the map.');
    generate();
    assert.equal(fs.readFileSync(criteriaFile, 'utf8'), approved);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('an Unverified evidence review queues one retry and keeps its report', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-unverified-retry-'));
  const dir = path.join(root, 'tickets', 'TEST2-99');
  const write = (name, value) => {
    const target = path.join(dir, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(value));
  };
  const run = () => execFileSync(process.execPath, [generator], { cwd: root, encoding: 'utf8' });
  try {
    write('ticket.json', { key: 'TEST2-99', fields: { summary: 'Check GIS zoom', created: '2026-09-25T00:00:00Z', status: { name: 'READY FOR TESTING' }, project: { key: 'TEST2' }, description: 'Acceptance Criteria:\nThe GIS zoom control is visible.' } });
    fs.writeFileSync(path.join(dir, 'criteria.md'), '- [ ] The GIS zoom control is visible.\n');
    write('status.json', { ticket: 'TEST2-99', jiraStatus: 'READY FOR TESTING', qaStatus: 'Evidence Reviewed', criteriaVerified: true, retries: 0, retryLimit: 3 });
    write('results.json', [{ criterion: 'The GIS zoom control is visible.', outcome: 'Passed' }]);
    write('history/attempt-001-test.json', { historyAttempt: 1, qaStatus: 'Awaiting Evidence Review', results: [{ criterion: 1, outcome: 'Passed' }] });
    write('review.json', { historyAttempt: 1, evidenceFolder: 'screenshots/attempt-001', overallOutcome: 'Unverified', qaStatus: 'Evidence Reviewed', criterionOutcomes: [{ criterion: 1, outcome: 'Unverified', reason: 'Final screenshot shows the launcher.' }] });
    fs.writeFileSync(path.join(dir, 'report.pdf'), 'verified report placeholder');
    run();
    const status = JSON.parse(fs.readFileSync(path.join(dir, 'status.json'), 'utf8'));
    const queue = JSON.parse(fs.readFileSync(path.join(root, 'status', 'handoffs.json'), 'utf8'));
    assert.equal(status.retries, 1);
    assert.equal(status.workflowState, 'Retry Queued');
    assert.equal(queue.handoffs[0]?.action, 'test_ticket');
    run();
    assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'status.json'), 'utf8')).retries, 1);

    // The second attempt is the limit even when its problem is transient.
    write('history/attempt-002-test.json', { historyAttempt: 2, qaStatus: 'Blocked', results: [{ criterion: 1, outcome: 'Blocked', retryClass: 'transient' }] });
    write('status.json', { ticket: 'TEST2-99', jiraStatus: 'READY FOR TESTING', qaStatus: 'Blocked', workflowState: 'Blocked', qaOutcome: 'Blocked', criteriaVerified: true, retries: 3, retryLimit: 3 });
    run();
    const recovered = JSON.parse(fs.readFileSync(path.join(dir, 'status.json'), 'utf8'));
    const next = JSON.parse(fs.readFileSync(path.join(root, 'status', 'handoffs.json'), 'utf8'));
    assert.equal(recovered.retries, 2);
    assert.equal(recovered.retryLimit, 2);
    assert.equal(recovered.qaStatus, 'Awaiting Evidence Review');
    assert.equal(next.handoffs[0]?.handoffId, 'handoff-TEST2-99-review-attempt-002');
    run();
    assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'status.json'), 'utf8')).retries, 2);

    write('review.json', { historyAttempt: 2, evidenceFolder: 'screenshots/attempt-002', overallOutcome: 'Blocked', qaStatus: 'Blocked', criterionOutcomes: [{ criterion: 1, outcome: 'Blocked', reason: 'Authentication stopped testing.' }] });
    run();
    const exhausted = JSON.parse(fs.readFileSync(path.join(dir, 'status.json'), 'utf8'));
    const finalQueue = JSON.parse(fs.readFileSync(path.join(root, 'status', 'handoffs.json'), 'utf8'));
    assert.equal(exhausted.retries, 2);
    assert.equal(exhausted.qaStatus, 'Blocked');
    assert.match(exhausted.nextAction, /Manual review required/);
    assert.equal(finalQueue.handoffs.length, 0);
    run();
    assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'status.json'), 'utf8')).qaStatus, 'Blocked');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('missing prerequisites, product failures, and legacy blocks go to review without retry', () => {
  for (const [name, result] of [
    ['missing account', { outcome: 'Blocked', retryClass: 'prerequisite' }],
    ['bad criterion', { outcome: 'Blocked', retryClass: 'criteria' }],
    ['product failure', { outcome: 'Failed', retryClass: 'product' }],
    ['legacy block', { outcome: 'Blocked' }]
  ]) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-manual-review-'));
    const dir = path.join(root, 'tickets', 'TEST2-99');
    try {
      fs.mkdirSync(path.join(dir, 'history'), { recursive: true });
      fs.writeFileSync(path.join(dir, 'ticket.json'), JSON.stringify({ key: 'TEST2-99', fields: { summary: name, status: { name: 'READY FOR TESTING' }, project: { key: 'TEST2' }, description: 'Acceptance Criteria:\nThe GIS layer is visible.' } }));
      fs.writeFileSync(path.join(dir, 'criteria.md'), '- [ ] The GIS layer is visible.\n');
      fs.writeFileSync(path.join(dir, 'status.json'), JSON.stringify({ ticket: 'TEST2-99', qaStatus: 'Ready for Testing', workflowState: 'Retry Queued', retries: 1, retryLimit: 3, criteriaVerified: true }));
      fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify([{ criterion: 'The GIS layer is visible.', ...result }]));
      fs.writeFileSync(path.join(dir, 'history', 'attempt-001-test.json'), JSON.stringify({ historyAttempt: 1, qaStatus: result.outcome === 'Blocked' ? 'Blocked' : 'Awaiting Evidence Review', results: [{ criterion: 1, ...result }] }));
      const run = () => execFileSync(process.execPath, [generator], { cwd: root });
      run();
      const status = JSON.parse(fs.readFileSync(path.join(dir, 'status.json'), 'utf8'));
      const queue = JSON.parse(fs.readFileSync(path.join(root, 'status', 'handoffs.json'), 'utf8'));
      assert.equal(status.retryLimit, 2, name);
      assert.equal(status.retries, 0, name);
      assert.equal(status.qaStatus, 'Awaiting Evidence Review', name);
      assert.equal(queue.handoffs[0]?.action, 'evidence_review', name);
      run();
      assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'status.json'), 'utf8')).retries, 0, name);
      fs.writeFileSync(path.join(dir, 'review.json'), JSON.stringify({ historyAttempt: 1, evidenceFolder: 'screenshots/attempt-001', overallOutcome: result.outcome, qaStatus: result.outcome === 'Blocked' ? 'Blocked' : 'Evidence Reviewed', criterionOutcomes: [{ criterion: 1, outcome: result.outcome, reason: name }] }));
      fs.writeFileSync(path.join(dir, 'report.pdf'), 'verified report placeholder');
      run();
      const done = JSON.parse(fs.readFileSync(path.join(dir, 'status.json'), 'utf8'));
      assert.equal(done.qaStatus, 'Blocked', name);
      assert.match(done.nextAction, /Manual review required; final evidence report published/, name);
      assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'status', 'handoffs.json'), 'utf8')).handoffs.length, 0, name);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  }
});

test('only a transient first test attempt queues one retry', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-transient-retry-'));
  const dir = path.join(root, 'tickets', 'TEST2-99');
  try {
    fs.mkdirSync(path.join(dir, 'history'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'ticket.json'), JSON.stringify({ key: 'TEST2-99', fields: { summary: 'Transient auth', status: { name: 'READY FOR TESTING' }, project: { key: 'TEST2' }, description: 'Acceptance Criteria:\nThe launcher is visible.' } }));
    fs.writeFileSync(path.join(dir, 'criteria.md'), '- [ ] The launcher is visible.\n');
    fs.writeFileSync(path.join(dir, 'status.json'), JSON.stringify({ ticket: 'TEST2-99', qaStatus: 'Blocked', retries: 0, retryLimit: 3, criteriaVerified: true }));
    fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify([{ criterion: 'The launcher is visible.', outcome: 'Blocked', retryClass: 'transient' }]));
    fs.writeFileSync(path.join(dir, 'history', 'attempt-001-test.json'), JSON.stringify({ historyAttempt: 1, qaStatus: 'Blocked', results: [{ criterion: 1, outcome: 'Blocked', retryClass: 'prerequisite', evidence: [], reason: 'The configured Playwright MCP server was not available.' }] }));
    const run = () => execFileSync(process.execPath, [generator], { cwd: root });
    run();
    const first = fs.readFileSync(path.join(dir, 'status.json'), 'utf8');
    assert.equal(JSON.parse(first).retries, 1);
    assert.equal(JSON.parse(first).workflowState, 'Retry Queued');
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'status', 'handoffs.json'), 'utf8')).handoffs[0]?.handoffId, 'handoff-TEST2-99-retry-attempt-002');
    run();
    assert.equal(fs.readFileSync(path.join(dir, 'status.json'), 'utf8'), first, 'polling must not spend the retry again');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('a rejected ticket does not spend retries or churn status on polling', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-rejected-retry-'));
  const dir = path.join(root, 'tickets', 'TEST2-99');
  const write = (name, value) => {
    const target = path.join(dir, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(value));
  };
  const run = () => execFileSync(process.execPath, [generator], { cwd: root, encoding: 'utf8' });
  try {
    write('ticket.json', { key: 'TEST2-99', fields: { summary: 'Rejected test', created: '2026-09-25T00:00:00Z', status: { name: 'Rejected' }, project: { key: 'TEST2' }, description: 'Acceptance Criteria:\nThe launcher is visible.' } });
    write('status.json', { ticket: 'TEST2-99', jiraStatus: 'Rejected', qaStatus: 'Ready for Testing', workflowState: 'Retry Queued', qaOutcome: 'Blocked', retries: 1, retryLimit: 3, criteriaVerified: true });
    write('history/attempt-002-test.json', { historyAttempt: 2, qaStatus: 'Blocked', results: [{ criterion: 1, outcome: 'Blocked' }] });
    fs.writeFileSync(path.join(dir, 'criteria.md'), '- [ ] The launcher is visible.\n');
    run();
    const first = fs.readFileSync(path.join(dir, 'status.json'), 'utf8');
    const generated = fs.readFileSync(path.join(root, 'status', 'tickets.json'), 'utf8');
    run();
    assert.equal(fs.readFileSync(path.join(dir, 'status.json'), 'utf8'), first);
    assert.equal(fs.readFileSync(path.join(root, 'status', 'tickets.json'), 'utf8'), generated);
    assert.ok(JSON.parse(first).retries <= 2);
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'status', 'handoffs.json'), 'utf8')).handoffs.length, 0);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('generated-status check accepts Windows CRLF checkout files', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-status-crlf-'));
  const ticketDir = path.join(root, 'tickets', 'TEST2-99');
  try {
    fs.mkdirSync(ticketDir, { recursive: true });
    fs.writeFileSync(path.join(ticketDir, 'ticket.json'), JSON.stringify({
      key: 'TEST2-99', fields: {
        summary: 'Check launcher', created: '2026-09-25T00:00:00Z',
        status: { name: 'READY FOR TESTING' }, project: { key: 'TEST2' },
        description: 'Acceptance Criteria:\nThe launcher is visible.'
      }
    }));
    fs.writeFileSync(path.join(ticketDir, 'criteria.md'), '- [ ] The launcher is visible.\n');
    fs.writeFileSync(path.join(ticketDir, 'status.json'), JSON.stringify({
      ticket: 'TEST2-99', jiraStatus: 'READY FOR TESTING', qaStatus: 'Ready for Testing',
      criteriaVerified: true, retries: 0, retryLimit: 3
    }));
    execFileSync(process.execPath, [generator], { cwd: root });
    const generated = [
      path.join(root, 'status', 'ticket-status.md'),
      path.join(root, 'status', 'tickets.json'),
      path.join(root, 'status', 'handoffs.json'),
      path.join(root, 'status', 'generated', 'TEST2-99.json'),
      path.join(ticketDir, 'ticket.md')
    ];
    for (const file of generated) {
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/\n/g, '\r\n'));
    }
    assert.doesNotThrow(() => execFileSync(process.execPath, [generator, '--check'], { cwd: root }));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('passed-ticket next action follows pending guide handoffs until the guide decision is complete', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-guide-next-action-'));
  const dir = path.join(root, 'tickets', 'TEST2-99');
  const write = (relative, value) => {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(value));
  };
  const run = () => {
    execFileSync(process.execPath, [generator], { cwd: root });
    return JSON.parse(fs.readFileSync(path.join(root, 'status/generated/TEST2-99.json'), 'utf8')).status.nextAction;
  };
  try {
    write('tickets/TEST2-99/ticket.json', { key: 'TEST2-99', fields: { summary: 'Launcher', status: { name: 'READY FOR TESTING' }, project: { key: 'TEST2' }, description: 'The launcher is visible.' } });
    fs.writeFileSync(path.join(dir, 'criteria.md'), '- [ ] The launcher is visible.\n');
    write('tickets/TEST2-99/status.json', { qaStatus: 'Evidence Reviewed', criteriaVerified: true });
    write('tickets/TEST2-99/results.json', [{ criterion: 1, outcome: 'Passed' }]);
    write('tickets/TEST2-99/history/attempt-001-test.json', { historyAttempt: 1, results: [{ criterion: 1, outcome: 'Passed' }] });
    write('tickets/TEST2-99/review.json', { historyAttempt: 1, overallOutcome: 'Passed', evidenceFolder: 'screenshots/attempt-001' });
    fs.writeFileSync(path.join(dir, 'report.pdf'), 'verified report fixture');
    for (const name of ['impact', 'update']) write(`config/user-guide-${name}-policy.json`, { enabled: true, onlyForPassedEvidenceReviews: true });
    assert.equal(run(), 'Create user-guide impact assessment handoff');
    write('tickets/TEST2-99/guide-impact.json', { decision: 'update_required' });
    assert.equal(run(), 'Create user-guide update authoring handoff');
    write('tickets/TEST2-99/guide-update.json', { title: 'Open launcher' });
    assert.equal(run(), 'QA review complete');
    fs.rmSync(path.join(dir, 'guide-update.json'));
    write('tickets/TEST2-99/guide-impact.json', { decision: 'not_needed' });
    assert.equal(run(), 'QA review complete');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('blocked criteria require manual review until the Jira issue changes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-criteria-block-'));
  const dir = path.join(root, 'tickets', 'TEST2-99');
  const ticket = updated => ({ key: 'TEST2-99', fields: {
    summary: 'Ambiguous request', updated, status: { name: 'Ready for Testing' },
    project: { key: 'TEST2' }, description: 'Unclear behaviour.'
  } });
  const run = () => execFileSync(process.execPath, [generator], { cwd: root });
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'ticket.json'), JSON.stringify(ticket('v1')));
    fs.writeFileSync(path.join(dir, 'status.json'), JSON.stringify({
      ticket: 'TEST2-99', qaStatus: 'Blocked', criteriaVerified: false,
      blockedStage: 'criteria', criteriaBlockReason: 'Which screen?',
      criteriaBlockedForJiraUpdated: 'v1', retries: 0, retryLimit: 3
    }));
    run();
    run();
    const status = JSON.parse(fs.readFileSync(path.join(dir, 'status.json'), 'utf8'));
    const summary = JSON.parse(fs.readFileSync(path.join(root, 'status', 'tickets.json'), 'utf8'));
    assert.equal(status.retries, 0);
    assert.equal(summary.tickets[0].qaStatus, 'Blocked');
    assert.match(summary.tickets[0].nextAction, /Which screen/);
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'status', 'handoffs.json'), 'utf8')).handoffs.length, 0);
    // Historical tester artifacts cannot override a newer criteria hold.
    fs.mkdirSync(path.join(dir, 'history'));
    fs.writeFileSync(path.join(dir, 'history', 'attempt-001-test.json'), JSON.stringify({ historyAttempt: 1, qaStatus: 'Blocked', results: [{ outcome: 'Blocked' }] }));
    fs.writeFileSync(path.join(dir, 'review.json'), JSON.stringify({ historyAttempt: 1, overallOutcome: 'Blocked', qaStatus: 'Blocked' }));
    fs.writeFileSync(path.join(dir, 'report.pdf'), 'prior report');
    run();
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'status', 'tickets.json'), 'utf8')).tickets[0].qaStatus, 'Blocked');
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'status', 'handoffs.json'), 'utf8')).handoffs.length, 0);
    fs.writeFileSync(path.join(dir, 'ticket.json'), JSON.stringify(ticket('v2')));
    run();
    const handoffs = JSON.parse(fs.readFileSync(path.join(root, 'status', 'handoffs.json'), 'utf8')).handoffs;
    assert.equal(handoffs[0]?.action, 'criteria_conversion');
    assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'status.json'), 'utf8')).retries, 0);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
