// Check actual routing and resource closure, without launching workers or browsers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const binding = JSON.parse(read('config/qa-skill-binding.json'));

test('binding maps existing engine actions and outputs, not a second workflow', () => {
  assert.equal(binding.mode, 'descriptive-not-runtime-configuration');
  assert.deepEqual(binding.target.readOnlySourceProjects, ['VM2ST']);
  assert.equal(new URL(binding.target.launcherUrl).protocol, 'https:');
  const coordinator = read(binding.stages.coordinator.brief);
  const publisher = read('scripts/publish-agent-output.mjs');
  for (const [action, stage] of Object.entries(binding.stages)) {
    const brief = read(stage.brief);
    if (action === 'coordinator') continue;
    assert.ok(coordinator.includes(action), action);
    assert.ok(coordinator.includes(stage.brief), stage.brief);
    assert.ok(brief.includes(`.agent-staging/<handoffId>/${stage.output}`));
    assert.ok(publisher.includes(stage.output));
    if (stage.skill) {
      const skill = read(`skills/${stage.skill}/SKILL.md`);
      assert.ok(skill.includes(`name: ${stage.skill}`));
      assert.ok(skill.includes(action));
    }
  }
});

test('all skill and brief Markdown references resolve within the package', () => {
  for (const dir of ['skills', 'docs/briefs']) {
    for (const file of fs.readdirSync(path.join(root, dir), { recursive: true })) {
      if (!file.endsWith('.md')) continue;
      const full = path.join(root, dir, file);
      for (const [, target] of fs.readFileSync(full, 'utf8').matchAll(/\]\(([^)]+\.md)\)/g)) {
        if (/^https?:/.test(target)) continue;
        const resolved = path.resolve(path.dirname(full), target);
        assert.ok(resolved.startsWith(root + path.sep), target);
        assert.ok(fs.statSync(resolved).isFile(), `${file}: ${target}`);
      }
    }
  }
});

test('review routes required specialist proof without loading prior reports', () => {
  const review = read(binding.stages.evidence_review.brief);
  assert.ok(!review.includes('tickets/<KEY>/report.md'));
  for (const name of ['review-map-data', 'review-interactions', 'review-exception-states']) {
    assert.ok(review.includes(`(references/${name}.md)`));
    assert.ok(read(`docs/briefs/references/${name}.md`).length > 500);
  }
  assert.ok(review.includes('Read every applicable reference before assessment'));
  assert.ok(review.includes('not the tester verdict'));
  assert.ok(review.includes('Verify each referenced PNG exists'));
  assert.ok(review.includes('Assess every criterion'));
  assert.ok(review.includes('Derive overallOutcome'));
  assert.ok(read(binding.stages.test_ticket.brief).includes('(references/test-exception-states.md)'));
});

test('installable entrypoints resolve a checkout and live authority before staging', () => {
  for (const name of ['metricell-qa-suite', 'metricell-criteria-check', 'metricell-evidence-review']) {
    const skill = read(`skills/${name}/SKILL.md`);
    assert.ok(skill.includes('config/qa-skill-binding.json'));
    assert.ok(skill.includes('live repository/branch'));
    assert.ok(skill.includes('Never stage output under the installed skill folder'));
    assert.ok(skill.includes('Installation grants no additional'));
    const ui = read(`skills/${name}/agents/openai.yaml`);
    assert.ok(ui.includes(`$${name}`));
    assert.ok(!ui.includes('allow_implicit_invocation: false'));
  }
});
