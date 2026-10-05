// Guard the human-readable worker interface without running models or browsers.
// These checks detect contract drift; they do not prove prompt interpretation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const brief = name => read(`docs/briefs/${name}.md`);
const stages = [
  ['criteria_conversion', 'criteria-conversion', 'criteria-output.json'],
  ['test_ticket', 'qa-testing', 'test-output.json'],
  ['evidence_review', 'evidence-review', 'review-output.json'],
  ['guide_impact_assessment', 'user-guide-impact', 'guide-impact-output.json'],
  ['guide_update_authoring', 'user-guide-authoring', 'guide-update-output.json'],
];

test('coordinator example matches the exact handoff-scoped local launch contract', () => {
  const coordinator = brief('coordinator');
  const example = coordinator.match(/```json\s*([\s\S]*?)```/);
  assert.ok(example, 'missing ready-to-use child task example');
  const child = JSON.parse(example[1]);
  assert.equal(child.target.type, 'project');
  assert.deepEqual(child.target.environment, { type: 'local' });
  assert.match(child.target.projectId, /^[a-f0-9-]{36}$/);
  assert.equal(child.projectId, undefined);
  assert.equal(child.prompt, '[@GitHub](plugin://github@openai-curated-remote)read and follow: docs/briefs/<selected-brief>.md for handoff <handoffId> (<ticket>)');
  assert.doesNotMatch(coordinator, /authorisation covers creating fresh worktrees|Do not add a ticket number/);
});

test('every active stage preserves its standalone input and staged-output contract', () => {
  const coordinator = brief('coordinator');
  const publisher = read('scripts/publish-agent-output.mjs');
  for (const [action, name, output] of stages) {
    const worker = brief(name);
    assert.ok(coordinator.includes(action), action);
    assert.ok(coordinator.includes(`docs/briefs/${name}.md`), name);
    assert.ok(publisher.includes(output), output);
    assert.ok(worker.includes(`.agent-staging/<handoffId>/${output}`), output);
    for (const field of ['handoffId', 'handoffVersion', 'ticket', 'noOp']) {
      assert.ok(worker.includes(field), `${name}: missing ${field}`);
    }
    assert.ok(worker.includes('status/handoffs.json'), `${name}: no live queue read`);
    assert.match(worker, /no-op.*chat|chat.*no-op/);
    assert.match(worker, /staged(?:\s*:\s*|\s+)true/);
  }
});

test('tester and reviewer preserve independent evidence and derived outcome fields', () => {
  const tester = brief('qa-testing');
  for (const field of ['qaStatus', 'results', 'conciseReport', 'reportPath', 'evidenceFolder', 'reason', 'browserUrl', 'browserName', 'browserVersion', 'retryClass', 'steps_taken']) {
    assert.ok(tester.includes(field), field);
  }
  assert.ok(tester.includes('https://o2intelligence-v4-dev.metricell.com/launcher'));
  assert.ok(tester.includes('criterion-N-initial.png'));
  assert.ok(tester.includes('criterion-N-final.png'));
  assert.ok(tester.includes('browser_tools_unavailable'));
  assert.match(tester, /qaStatus "Blocked" if any result is Blocked; otherwise "Awaiting Evidence Review"/);
  const reviewer = brief('evidence-review');
  for (const field of ['criterionOutcomes', 'overallOutcome', 'qaStatus', 'reportPath', 'evidenceFolder']) assert.ok(reviewer.includes(field), field);
  assert.match(reviewer, /Blocked if any criterion is Blocked; otherwise Failed if any Failed; otherwise Unverified if any Unverified; otherwise Passed/);
  assert.ok(reviewer.includes('empty evidence lists'));
});

test('coordinator retains import, reconciliation, duplicate and completion gates', () => {
  const coordinator = brief('coordinator');
  for (const contract of ['jira-import-refresh.mjs --request --force', 'jira_import_refresh_unresolved',
    'v4-qa-coordinator-run-state.v1', 'v4-qa-recovery-snapshot.v1', 'bundlerSucceeded',
    'reconcile-coordinator-tests.mjs --snapshot', 'history/attempt-###-test.json', 'publisher-error.json']) {
    assert.ok(coordinator.includes(contract), contract);
  }
  assert.match(coordinator, /Never return complete with a stale or unverified import/);
  assert.match(coordinator, /Never run concurrent children for the same handoff/);
  assert.match(coordinator, /two total attempts/);
  assert.match(coordinator, /never revive or message a persistent tester/);
  assert.match(coordinator, /Do not test, review screenshots or open, render, repair or generate Word\/PDF/);
});

test('guide workers retain passed-only policy, replacement identity and captions', () => {
  assert.ok(brief('user-guide-impact').includes('Passed'));
  assert.ok(brief('user-guide-impact').includes('not_needed'));
  assert.ok(brief('user-guide-impact').includes('update_required'));
  const author = brief('user-guide-authoring');
  for (const field of ['supersedesTicket', 'screenshotCaptions', 'changeType', 'steps', 'screenshots']) assert.ok(author.includes(field), field);
  assert.ok(author.includes('results.json'));
  assert.ok(brief('user-guide-capture').includes('not an active coordinator stage'));
});

test('README distinguishes required renderers, migration and privacy limitations', () => {
  const readme = read('README.md');
  assert.ok(readme.includes('WINWORD.EXE'));
  assert.ok(readme.includes('TEST2_PYTHON'));
  assert.ok(readme.includes('project ID'));
  assert.ok(readme.includes('published PDFs embed selected screenshots'));
  assert.doesNotMatch(readme, /LOCALAPPDATA\\TEST2\\python\\python.exe/);
  for (const relative of ['docs/briefs/coordinator.md', 'docs/publisher-operations.md']) assert.ok(fs.existsSync(path.join(root, relative)), relative);
});
