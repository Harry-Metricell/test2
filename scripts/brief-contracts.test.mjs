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

test('coordinator suppresses repeated unchanged-status narration', () => {
  const coordinator = brief('coordinator');
  assert.match(coordinator, /Announce each stage transition at most once per batch/);
  assert.match(coordinator, /Record polling observations in ignored run state, not chat/);
  assert.match(coordinator, /no optional updates between those required intervals/);
  assert.match(coordinator, /Use an event whitelist, not a running narrative/);
  assert.match(coordinator, /batch:<stage>:started/);
  assert.match(coordinator, /staged receipts, publisher pickup, push success, bundler start/);
  assert.match(coordinator, /Quiet communication must never end a wait or bypass a publication gate/);
});

test('coordinator preserves economical worker allocation without restarting work', () => {
  const coordinator = brief('coordinator');
  assert.match(coordinator, /set model "gpt-6-luna" and thinking "low" for criteria, guide-impact and guide-authoring children/);
  assert.match(coordinator, /Tester\/reviewer children retain their configured stronger browser\/review-capable model; omit overrides/);
  assert.match(coordinator, /Keep the coordinator's own model unchanged/);
  assert.match(coordinator, /do not restart or repeat existing work to change its model/);
  assert.doesNotMatch(coordinator, /gpt-5\.6-luna/);
});

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
  assert.ok(tester.includes('wait for the expected visible transition to settle'));
  assert.ok(brief('evidence-review').includes('Inspect actual visible states, not capture filenames'));
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

test('different tickets cannot concurrently operate the shared MCP browser', () => {
  const coordinator = brief('coordinator');
  const tester = brief('qa-testing');
  assert.ok(coordinator.includes('Run at most one browser tester across all tickets'));
  assert.ok(coordinator.includes('testers started before leases were introduced'));
  assert.ok(coordinator.includes('unavailable child observation reserves the browser'));
  assert.ok(tester.includes('tester-browser-lease.mjs --acquire <handoffId>'));
  assert.ok(tester.includes('tester-browser-lease.mjs --release <handoffId> <token>'));
  assert.ok(tester.includes('without opening/navigating the browser, staging a result, or consuming an attempt'));
  assert.ok(tester.includes('A repeated 500 preventing point retrieval blocks dependent detail checks'));
});

test('criteria, tester and reviewer reject unstated populated-list prerequisites', () => {
  for (const name of ['criteria-conversion', 'qa-testing', 'evidence-review']) {
    const worker = brief(name);
    assert.match(worker, /An empty initial list is a valid baseline/);
    assert.match(worker, /populated entries/);
    assert.match(worker, /reordering|Reordering/);
    assert.match(worker, /remov/);
  }
  assert.match(brief('qa-testing'), /Do not block solely because an unchanged list has zero entries/);
  assert.match(brief('qa-testing'), /missing panel alone, loading failure or inaccessible list is not proof of emptiness/);
  assert.match(brief('qa-testing'), /remained empty/);
  assert.match(brief('evidence-review'), /use Unverified for insufficient proof rather than inventing a missing-fixture blocker/);
  assert.match(brief('evidence-review'), /without claiming populated ordering coverage/);
});

test('workers preserve visible catalogue scope rather than inventing complete coverage', () => {
  assert.match(brief('criteria-conversion'), /visible catalogue entries do not mean every off-screen entry/);
  assert.match(brief('qa-testing'), /Match visible-viewport versus complete-list scope exactly/);
  assert.match(brief('evidence-review'), /not off-screen entries unless the criterion requires them/);
  assert.match(brief('evidence-review'), /every gap must trace to the same canonical criterion and scope/);
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

test('guide impact never substitutes a stale Desktop queue for live input', () => {
  const impact = brief('user-guide-impact');
  for (const rule of ['Resolve the current main commit', 'at the same commit',
    'Local checkout files are not authoritative', 'never use `Get-Content`',
    'Before an absent/changed-handoff no-op, refetch', 'live_read_unavailable',
    'Do not stage an assessment without verified live inputs']) {
    assert.ok(impact.includes(rule), rule);
  }
  assert.ok(brief('coordinator').includes('Local queue absence never proves live handoff absence'));
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
