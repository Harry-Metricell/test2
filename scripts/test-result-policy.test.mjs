import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBrowserToolBlock, isNoEvidenceBlock } from './test-result-policy.mjs';

test('older MCP-unavailable results get their one transient retry', () => {
  const result = { outcome: 'Blocked', evidence: [], retryClass: 'prerequisite', reason: 'The configured Playwright MCP server was not available.' };
  assert.equal(normalizeBrowserToolBlock(result).retryClass, 'transient');
  assert.equal(normalizeBrowserToolBlock({ ...result, reason: 'No account has access to this layer.' }).retryClass, 'prerequisite');
  assert.equal(normalizeBrowserToolBlock({ ...result, outcome: 'Failed' }).retryClass, 'prerequisite');
});

test('no-image exception cannot publish a pass or lost claimed evidence', () => {
  const review = { overallOutcome: 'Blocked', criterionOutcomes: [{ outcome: 'Blocked', reason: 'Tools unavailable.' }] };
  const results = [{ outcome: 'Blocked', reason: 'Tools unavailable.', evidence: [] }];
  assert.equal(isNoEvidenceBlock(review, results), true);
  assert.equal(isNoEvidenceBlock(review, [{ ...results[0], outcome: 'Passed' }]), false);
  assert.equal(isNoEvidenceBlock(review, [{ ...results[0], evidence: ['missing.png'] }]), false);
  assert.equal(isNoEvidenceBlock({ ...review, overallOutcome: 'Passed' }, results), false);
});
