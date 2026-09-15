import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const publisher = fileURLToPath(new URL('./publish-agent-output.mjs', import.meta.url));
const git = process.env.TEST2_GIT;
if (!git) throw new Error('Set TEST2_GIT to the absolute Git executable path');

test('publishes new remote tickets from stale dirty Desktop; rejects absent PNGs', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publisher regression '));
  const remote = path.join(root, 'remote.git');
  const seed = path.join(root, 'seed');
  const desktop = path.join(root, 'desktop');
  const g = (cwd, ...args) => execFileSync(git, ['-C', cwd, ...args], { encoding: 'utf8', windowsHide: true }).trim();
  const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); };
  try {
    fs.mkdirSync(remote); g(remote, 'init', '--bare');
    fs.mkdirSync(seed); g(seed, 'init', '-b', 'main');
    g(seed, 'config', 'user.name', 'Publisher Test'); g(seed, 'config', 'user.email', 'test@example.invalid');
    write(path.join(seed, 'README.md'), 'original\n');
    g(seed, 'add', '.'); g(seed, 'commit', '-m', 'Initial');
    g(seed, 'remote', 'add', 'origin', remote); g(seed, 'push', '-u', 'origin', 'main');
    g(root, 'clone', '-b', 'main', remote, desktop);
    g(desktop, 'config', 'user.name', 'Publisher Test'); g(desktop, 'config', 'user.email', 'test@example.invalid');
    write(path.join(desktop, 'README.md'), 'user edit must survive\n');
    write(path.join(seed, 'tickets/TEST2-99/status.json'), JSON.stringify({ ticket: 'TEST2-99', retries: 0, jiraStatus: 'READY FOR TESTING' }));
    g(seed, 'add', '.'); g(seed, 'commit', '-m', 'Ticket exists only remotely'); g(seed, 'push');
    const stage = path.join(desktop, '.agent-staging/handoff-TEST2-99-criteria');
    write(path.join(stage, 'criteria-output.json'), JSON.stringify({ handoffId: 'handoff-TEST2-99-criteria', ticket: 'TEST2-99', criteriaMarkdown: '- [ ] Launcher is visible.', qaStatus: 'Ready for Testing', noOp: false }));
    const env = { ...process.env, TEST2_GIT: git, TEST2_REPO: desktop, TEST2_PUBLISHER_LOCK: path.join(root, 'publisher.lock'), TEST2_PUBLISHER_LOG: path.join(root, 'publisher.log'), TEST2_EVIDENCE: path.join(root, 'evidence') };
    const run = () => spawnSync(process.execPath, [publisher], { env, encoding: 'utf8', windowsHide: true });
    const first = run(); assert.equal(first.status, 0, first.stderr);
    g(seed, 'fetch');
    assert.equal(JSON.parse(g(seed, 'show', 'origin/main:tickets/TEST2-99/status.json')).criteriaVerified, true);
    assert.equal(fs.readFileSync(path.join(desktop, 'README.md'), 'utf8'), 'user edit must survive\n');
    assert.equal(fs.existsSync(path.join(desktop, 'tickets/TEST2-99/status.json')), false);
    assert.equal(fs.existsSync(stage), false);
    const testStage = path.join(desktop, '.agent-staging/handoff-TEST2-99-test');
    write(path.join(testStage, 'test-output.json'), JSON.stringify({ handoffId: 'handoff-TEST2-99-test', ticket: 'TEST2-99', qaStatus: 'Awaiting Evidence Review', results: [{ outcome: 'Passed', evidence: ['missing.png'] }], conciseReport: 'Passed' }));
    const before = g(seed, 'rev-parse', 'origin/main');
    const second = run(); assert.equal(second.status, 1); assert.match(second.stderr, /Missing staged PNG/);
    g(seed, 'fetch'); assert.equal(g(seed, 'rev-parse', 'origin/main'), before);
    assert.equal(fs.existsSync(path.join(testStage, 'test-output.json')), true);
    assert.match(fs.readFileSync(path.join(root, 'publisher.log'), 'utf8'), /Missing staged PNG/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
