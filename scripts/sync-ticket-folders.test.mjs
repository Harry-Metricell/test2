import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const importer = fileURLToPath(new URL('./sync-ticket-folders.mjs', import.meta.url));

test('Done tickets are archived with history and restored when reopened', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-import-archive-'));
  const active = path.join(root, 'tickets', 'TEST2-99');
  const archived = path.join(root, 'archive', 'tickets', 'TEST2-99');
  const run = (issues, isLast = true) => {
    fs.writeFileSync(path.join(root, 'results.json'), JSON.stringify({ issues, isLast }));
    return execFileSync(process.execPath, [importer], { cwd: root, encoding: 'utf8' });
  };
  const issue = (status, updated = '2026-09-29') => ({ key: 'TEST2-99', fields: { status: { name: status }, updated } });
  try {
    run([issue('Ready for Testing')]);
    assert.equal(JSON.parse(fs.readFileSync(path.join(active, 'status.json'), 'utf8')).retryLimit, 2);
    fs.mkdirSync(path.join(active, 'history'));
    fs.writeFileSync(path.join(active, 'history', 'attempt-001-test.json'), '{"passed":true}');
    fs.writeFileSync(path.join(active, 'report.pdf'), 'report');
    run([issue('Done')]);
    assert.equal(fs.existsSync(active), false);
    assert.equal(fs.readFileSync(path.join(archived, 'history', 'attempt-001-test.json'), 'utf8'), '{"passed":true}');
    assert.equal(fs.readFileSync(path.join(archived, 'report.pdf'), 'utf8'), 'report');
    assert.equal(JSON.parse(fs.readFileSync(path.join(archived, 'archive.json'), 'utf8')).reason, 'Jira Done');
    run([issue('Done')]);
    assert.throws(() => run([], false));
    assert.equal(fs.existsSync(archived), true);
    run([issue('Ready for Testing', '2026-09-30')]);
    assert.equal(fs.existsSync(archived), false);
    assert.equal(fs.existsSync(path.join(active, 'archive.json')), false);
    assert.equal(fs.readFileSync(path.join(active, 'report.pdf'), 'utf8'), 'report');
    assert.equal(JSON.parse(fs.readFileSync(path.join(active, 'ticket.json'), 'utf8')).fields.updated, '2026-09-30');
    assert.equal(JSON.parse(fs.readFileSync(path.join(active, 'status.json'), 'utf8')).retryLimit, 2);
    run([]);
    assert.equal(JSON.parse(fs.readFileSync(path.join(archived, 'archive.json'), 'utf8')).reason, 'Absent from complete Jira response');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
