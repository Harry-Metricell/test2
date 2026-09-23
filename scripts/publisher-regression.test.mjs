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

test('publishes new remote tickets from stale dirty Desktop; rejects incomplete evidence', () => {
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
    write(path.join(seed, 'config/user-guide-impact-policy.json'), JSON.stringify({ schema: 'v4-user-guide-impact-policy.v1', enabled: true, onlyForPassedEvidenceReviews: true, decisions: ['not_needed', 'update_required'], requireAffectedSectionWhenUpdateRequired: true, requireReason: true }));
    g(seed, 'add', '.'); g(seed, 'commit', '-m', 'Initial');
    g(seed, 'remote', 'add', 'origin', remote); g(seed, 'push', '-u', 'origin', 'main');
    g(root, 'clone', '-b', 'main', remote, desktop);
    g(desktop, 'config', 'user.name', 'Publisher Test'); g(desktop, 'config', 'user.email', 'test@example.invalid');
    write(path.join(desktop, 'README.md'), 'user edit must survive\n');
    write(path.join(seed, 'tickets/TEST2-99/status.json'), JSON.stringify({ ticket: 'TEST2-99', retries: 0, jiraStatus: 'READY FOR TESTING' }));
    write(path.join(seed, 'status/handoffs.json'), JSON.stringify({ handoffs: [{ handoffId: 'handoff-TEST2-99-criteria', handoffVersion: 'TEST2-99:criteria_conversion:1', ticket: 'TEST2-99', action: 'criteria_conversion' }] }));
    g(seed, 'add', '.'); g(seed, 'commit', '-m', 'Ticket exists only remotely'); g(seed, 'push');
    const stage = path.join(desktop, '.agent-staging/handoff-TEST2-99-criteria');
    write(path.join(stage, 'criteria-output.json'), JSON.stringify({ handoffId: 'handoff-TEST2-99-criteria', handoffVersion: 'TEST2-99:criteria_conversion:1', ticket: 'TEST2-99', criteriaMarkdown: '- [ ] Launcher is visible.', qaStatus: 'Ready for Testing', noOp: false }));
    const env = { ...process.env, TEST2_GIT: git, TEST2_REPO: desktop, TEST2_PUBLISHER_LOCK: path.join(root, 'publisher.lock'), TEST2_PUBLISHER_LOG: path.join(root, 'publisher.log'), TEST2_EVIDENCE: path.join(root, 'evidence') };
    const run = () => spawnSync(process.execPath, [publisher], { env, encoding: 'utf8', windowsHide: true });
    const first = run(); assert.equal(first.status, 0, first.stderr);
    g(seed, 'fetch');
    assert.equal(JSON.parse(g(seed, 'show', 'origin/main:tickets/TEST2-99/status.json')).criteriaVerified, true);
    assert.equal(fs.readFileSync(path.join(desktop, 'README.md'), 'utf8'), 'user edit must survive\n');
    assert.equal(fs.existsSync(path.join(desktop, 'tickets/TEST2-99/status.json')), false);
    assert.equal(fs.existsSync(stage), false);
    g(seed, 'fetch'); g(seed, 'reset', '--hard', 'origin/main');
    write(path.join(seed, 'status/handoffs.json'), JSON.stringify({ handoffs: [{ handoffId: 'handoff-TEST2-99-test-attempt-001', handoffVersion: 'TEST2-99:test_ticket:1', ticket: 'TEST2-99', action: 'test_ticket' }] }));
    g(seed, 'add', '.'); g(seed, 'commit', '-m', 'Queue TEST2 test'); g(seed, 'push');
    const testStage = path.join(desktop, '.agent-staging/handoff-TEST2-99-test-attempt-001');
    // A clear paraphrase should canonicalize to the checklist item; this
    // fixture then fails for its deliberately incomplete screenshot evidence.
    write(path.join(testStage, 'test-output.json'), JSON.stringify({ handoffId: 'handoff-TEST2-99-test-attempt-001', handoffVersion: 'TEST2-99:test_ticket:1', ticket: 'TEST2-99', qaStatus: 'Awaiting Evidence Review', results: [{ criterion: 'The launcher page is visible.', outcome: 'Passed', evidence: ['criterion-1-initial.png'] }], conciseReport: 'Passed' }));
    const before = g(seed, 'rev-parse', 'origin/main');
    const second = run(); assert.equal(second.status, 1); assert.match(second.stderr, /needs its own initial and final PNG evidence/);
    g(seed, 'fetch'); assert.equal(g(seed, 'rev-parse', 'origin/main'), before);
    assert.equal(fs.existsSync(path.join(testStage, 'test-output.json')), true);
    assert.match(fs.readFileSync(path.join(root, 'publisher.log'), 'utf8'), /needs its own initial and final PNG evidence/);
    fs.rmSync(testStage, { recursive: true, force: true });

    // A tester cannot silently omit a criterion, even before evidence copying.
    g(seed, 'fetch'); g(seed, 'reset', '--hard', 'origin/main');
    write(path.join(seed, 'status/handoffs.json'), JSON.stringify({ handoffs: [{ handoffId: 'handoff-TEST2-99-test-attempt-002', handoffVersion: 'TEST2-99:test_ticket:2', ticket: 'TEST2-99', action: 'test_ticket' }] }));
    g(seed, 'add', '.'); g(seed, 'commit', '-m', 'Queue incomplete TEST2 test'); g(seed, 'push');
    const incompleteStage = path.join(desktop, '.agent-staging/handoff-TEST2-99-test-attempt-002');
    write(path.join(incompleteStage, 'test-output.json'), JSON.stringify({ handoffId: 'handoff-TEST2-99-test-attempt-002', handoffVersion: 'TEST2-99:test_ticket:2', ticket: 'TEST2-99', qaStatus: 'Awaiting Evidence Review', results: [], conciseReport: 'Incomplete' }));
    const incomplete = run(); assert.equal(incomplete.status, 1); assert.match(incomplete.stderr, /exactly one result for each/);
    fs.rmSync(incompleteStage, { recursive: true, force: true });

    // A blocked criterion cannot be published as an evidence-review-ready test.
    g(seed, 'fetch'); g(seed, 'reset', '--hard', 'origin/main');
    write(path.join(seed, 'status/handoffs.json'), JSON.stringify({ handoffs: [{ handoffId: 'handoff-TEST2-99-test-attempt-002-status', handoffVersion: 'TEST2-99:test_ticket:2-status', ticket: 'TEST2-99', action: 'test_ticket' }] }));
    g(seed, 'add', '.'); g(seed, 'commit', '-m', 'Queue inconsistent TEST2 test status'); g(seed, 'push');
    const inconsistentStatusStage = path.join(desktop, '.agent-staging/handoff-TEST2-99-test-attempt-002-status');
    write(path.join(inconsistentStatusStage, 'test-output.json'), JSON.stringify({ handoffId: 'handoff-TEST2-99-test-attempt-002-status', handoffVersion: 'TEST2-99:test_ticket:2-status', ticket: 'TEST2-99', qaStatus: 'Awaiting Evidence Review', results: [{ criterion: 'Launcher is visible.', outcome: 'Blocked', evidence: [] }], conciseReport: 'Inconsistent status' }));
    const inconsistentStatus = run(); assert.equal(inconsistentStatus.status, 1); assert.match(inconsistentStatus.stderr, /Tester qaStatus must be Blocked/);
    fs.rmSync(inconsistentStatusStage, { recursive: true, force: true });

    // Outcome values are a closed, auditable set rather than arbitrary text.
    g(seed, 'fetch'); g(seed, 'reset', '--hard', 'origin/main');
    write(path.join(seed, 'status/handoffs.json'), JSON.stringify({ handoffs: [{ handoffId: 'handoff-TEST2-99-test-attempt-003', handoffVersion: 'TEST2-99:test_ticket:3', ticket: 'TEST2-99', action: 'test_ticket' }] }));
    g(seed, 'add', '.'); g(seed, 'commit', '-m', 'Queue invalid-outcome TEST2 test'); g(seed, 'push');
    const invalidOutcomeStage = path.join(desktop, '.agent-staging/handoff-TEST2-99-test-attempt-003');
    write(path.join(invalidOutcomeStage, 'test-output.json'), JSON.stringify({ handoffId: 'handoff-TEST2-99-test-attempt-003', handoffVersion: 'TEST2-99:test_ticket:3', ticket: 'TEST2-99', qaStatus: 'Awaiting Evidence Review', results: [{ criterion: 'Launcher is visible.', outcome: 'Maybe', evidence: [] }], conciseReport: 'Invalid' }));
    const invalidOutcome = run(); assert.equal(invalidOutcome.status, 1); assert.match(invalidOutcome.stderr, /invalid outcome: Maybe/);
    fs.rmSync(invalidOutcomeStage, { recursive: true, force: true });
    const staleStage = path.join(desktop, '.agent-staging/handoff-TEST2-99-stale');
    write(path.join(staleStage, 'criteria-output.json'), JSON.stringify({ handoffId: 'handoff-TEST2-99-stale', handoffVersion: 'TEST2-99:criteria_conversion:stale', ticket: 'TEST2-99', criteriaMarkdown: '- [ ] Stale output.', qaStatus: 'Ready for Testing', noOp: false }));
    const stale = run(); assert.equal(stale.status, 1); assert.match(stale.stderr, /Stale or mismatched worker output/);
    assert.equal(fs.existsSync(path.join(staleStage, 'criteria-output.json')), true);
    const noOpStage = path.join(desktop, '.agent-staging/handoff-TEST2-99-noop');
    write(path.join(noOpStage, 'review-output.json'), JSON.stringify({ handoffId: 'handoff-TEST2-99-noop', ticket: 'TEST2-99', noOp: true }));
    const noOp = run(); assert.equal(noOp.status, 0, noOp.stderr);
    assert.equal(fs.existsSync(noOpStage), false);

    // Reviewer summaries are derived from criterion results, so a failed item
    // cannot be smuggled through as a passed review.
    g(seed, 'fetch'); g(seed, 'reset', '--hard', 'origin/main');
    write(path.join(seed, 'status/handoffs.json'), JSON.stringify({ handoffs: [{ handoffId: 'handoff-TEST2-99-review-invalid-summary', handoffVersion: 'TEST2-99:evidence_review:1', ticket: 'TEST2-99', action: 'evidence_review' }] }));
    g(seed, 'add', '.'); g(seed, 'commit', '-m', 'Queue invalid review summary'); g(seed, 'push');
    const invalidReviewStage = path.join(desktop, '.agent-staging/handoff-TEST2-99-review-invalid-summary');
    write(path.join(invalidReviewStage, 'review-output.json'), JSON.stringify({ handoffId: 'handoff-TEST2-99-review-invalid-summary', handoffVersion: 'TEST2-99:evidence_review:1', ticket: 'TEST2-99', criterionOutcomes: [{ criterion: 1, outcome: 'Failed', reason: 'Expected control was absent.' }], overallOutcome: 'Passed', qaStatus: 'Evidence Reviewed', reportPath: '', evidenceFolder: '', noOp: false, reason: 'Invalid summary fixture.' }));
    const invalidReview = run(); assert.equal(invalidReview.status, 1); assert.match(invalidReview.stderr, /overallOutcome must be Failed/);
    fs.rmSync(invalidReviewStage, { recursive: true, force: true });

    // A one-based numeric criterion reference is safely mapped before later
    // report prerequisites are checked.
    g(seed, 'fetch'); g(seed, 'reset', '--hard', 'origin/main');
    write(path.join(seed, 'status/handoffs.json'), JSON.stringify({ handoffs: [{ handoffId: 'handoff-TEST2-99-review-numeric', handoffVersion: 'TEST2-99:evidence_review:1', ticket: 'TEST2-99', action: 'evidence_review' }] }));
    g(seed, 'add', '.'); g(seed, 'commit', '-m', 'Queue numeric review'); g(seed, 'push');
    const numericReviewStage = path.join(desktop, '.agent-staging/handoff-TEST2-99-review-numeric');
    write(path.join(numericReviewStage, 'review-output.json'), JSON.stringify({ handoffId: 'handoff-TEST2-99-review-numeric', handoffVersion: 'TEST2-99:evidence_review:1', ticket: 'TEST2-99', criterionOutcomes: [{ criterion: 1, outcome: 'Passed', reason: 'Visible.' }], overallOutcome: 'Passed', qaStatus: 'Evidence Reviewed', reportPath: '', evidenceFolder: '', noOp: false, reason: 'Numeric criterion fixture.' }));
    const numericReview = run(); assert.equal(numericReview.status, 1); assert.match(numericReview.stderr, /Cannot publish evidence review before tester results.json is present/);
    fs.rmSync(numericReviewStage, { recursive: true, force: true });

    // Guide impact is accepted only after a passed evidence review with its PDF,
    // then becomes a durable, publishable ticket decision.
    fs.rmSync(staleStage, { recursive: true, force: true });
    fs.rmSync(invalidOutcomeStage, { recursive: true, force: true });
    g(seed, 'fetch'); g(seed, 'reset', '--hard', 'origin/main');
    write(path.join(seed, 'tickets/TEST2-99/review.json'), JSON.stringify({ overallOutcome: 'Passed', qaStatus: 'Evidence Reviewed' }));
    write(path.join(seed, 'tickets/TEST2-99/report.pdf'), 'verified evidence report');
    write(path.join(seed, 'status/handoffs.json'), JSON.stringify({ handoffs: [{ handoffId: 'handoff-TEST2-99-guide-impact', handoffVersion: 'TEST2-99:guide_impact_assessment:1', ticket: 'TEST2-99', action: 'guide_impact_assessment' }] }));
    g(seed, 'add', '.'); g(seed, 'commit', '-m', 'Queue guide impact assessment'); g(seed, 'push');
    const guideStage = path.join(desktop, '.agent-staging/handoff-TEST2-99-guide-impact');
    write(path.join(guideStage, 'guide-impact-output.json'), JSON.stringify({ handoffId: 'handoff-TEST2-99-guide-impact', handoffVersion: 'TEST2-99:guide_impact_assessment:1', ticket: 'TEST2-99', decision: 'not_needed', affectedSection: '', reason: 'The verified change has no end-user instructions.', noOp: false }));
    const guideImpact = run(); assert.equal(guideImpact.status, 0, `${guideImpact.stderr}\n${guideImpact.stdout}`);
    g(seed, 'fetch');
    assert.equal(JSON.parse(g(seed, 'show', 'origin/main:tickets/TEST2-99/guide-impact.json')).decision, 'not_needed');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
