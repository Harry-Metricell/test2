import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readTestingContext, testingContextPath, contextHandoff, contextualCriteria, requireTestedModule } from './testing-context.mjs';

const context = { schema: 'v4-qa-testing-context.v1', ticket: 'TEST2-99',
  source: { key: 'SOURCE-1', parent: { key: 'SOURCE-EPIC' } },
  targetModule: 'Automobile', targetLayer: 'Download', resolution: { authority: 'human' } };

test('context changes handoff revision but not cycle, attempt or evidence path', () => {
  const h = { handoffId: 'handoff-TEST2-99-cycle-002-test-attempt-001', handoffVersion: 'TEST2-99:cycle-002:test_ticket:1',
    attempt: 1, inputs: { evidenceFolder: 'TEST2-99/cycles/cycle-002/screenshots/attempt-001' } };
  const first = contextHandoff(h, context);
  assert.equal(first.handoffId, h.handoffId);
  assert.equal(first.attempt, 1);
  assert.equal(first.inputs.evidenceFolder, h.inputs.evidenceFolder);
  assert.equal(first.inputs.testingContext, 'config/testing-context/TEST2-99.json');
  assert.notEqual(first.handoffVersion, h.handoffVersion);
  assert.equal(first.handoffVersion, contextHandoff(h, { ...context }).handoffVersion);
  assert.notEqual(first.handoffVersion, contextHandoff(h, { ...context, targetLayer: 'Ping' }).handoffVersion);
  assert.equal(contextHandoff(null, context), null);
  assert.equal(contextHandoff(h, null), h);
});

test('scope setup correction preserves every checklist byte and is idempotent', () => {
  const checklist = '- [ ] Given Download samples are available, show each sample with units.\n';
  const old = '<!-- Converted from the complete Jira ticket source -->\n<!-- Verified testing context: Surveyor > Download. -->\n' + checklist;
  const corrected = contextualCriteria(old, context);
  assert.ok(corrected.includes(checklist));
  assert.ok(corrected.includes('Converted from the complete Jira ticket source'));
  assert.ok(!corrected.includes('Surveyor > Download'));
  assert.ok(corrected.includes('Testing scope: Automobile'));
  assert.equal(contextualCriteria(corrected, context), corrected);
  assert.equal(contextualCriteria(old, null), old);
});

test('publication requires matching module provenance including all-blocked runs', () => {
  assert.doesNotThrow(() => requireTestedModule(context, { testedModule: 'Automobile' }));
  for (const output of [{}, { testedModule: 'Surveyor' }]) {
    assert.throws(() => requireTestedModule(context, output), /testedModule must be Automobile/);
  }
  assert.throws(() => requireTestedModule(context, { testedModule: 'Automobile' }, [{}]), /tester results/);
  assert.throws(() => requireTestedModule(context, { testedModule: 'Automobile' }, [{ testedModule: 'Surveyor' }]), /tester results/);
  assert.doesNotThrow(() => requireTestedModule(context, { testedModule: 'Automobile' }, [{ testedModule: 'Automobile', outcome: 'Blocked' }]));
  assert.doesNotThrow(() => requireTestedModule(null, {}));
});

test('context loading rejects unconfirmed, wrong-ticket and malformed scope', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-context-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  assert.equal(readTestingContext(root, 'TEST2-99'), null);
  const file = path.join(root, testingContextPath('TEST2-99'));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  for (const value of [{ ...context, ticket: 'TEST2-98' }, { ...context, resolution: { authority: 'worker' } }, { ...context, source: {} }]) {
    fs.writeFileSync(file, JSON.stringify(value));
    assert.throws(() => readTestingContext(root, 'TEST2-99'), /invalid or unconfirmed/);
  }
  fs.writeFileSync(file, JSON.stringify(context));
  assert.deepEqual(readTestingContext(root, 'TEST2-99'), context);
  assert.throws(() => testingContextPath('../TEST2-99'), /Invalid/);
});

test('the copied 14-ticket batch retains source epic and human module decision', () => {
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  for (let n = 79; n <= 92; n++) {
    const c = readTestingContext(repo, `TEST2-${n}`);
    assert.equal(c.source.parent.key, 'VM2ST-66');
    assert.equal(c.targetModule, 'Automobile');
  }
});
