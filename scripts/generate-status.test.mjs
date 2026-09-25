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
