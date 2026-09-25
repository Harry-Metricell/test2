import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const generator = fileURLToPath(new URL('./generate-status.mjs', import.meta.url));

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
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
