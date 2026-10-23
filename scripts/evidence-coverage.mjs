// Structural guard, not an AI judge: workers still have to identify every real
// assertion and visually verify its proof. This prevents a declared gap passing.
export function coverageHandoff(handoff) {
  if (!handoff || !['test_ticket', 'evidence_review'].includes(handoff.action)) return handoff;
  return { ...handoff, evidenceCoverageVersion: 1 };
}

const outcomes = new Set(['Passed', 'Failed', 'Unverified', 'Blocked']);
const key = value => value.trim().replace(/\s+/g, ' ').toLowerCase();
export function validateEvidenceCoverage(items, { required = false, results } = {}) {
  for (const [index, item] of items.entries()) {
    const checks = item.coverageChecks;
    if (checks === undefined && !required) continue; // Existing immutable histories remain readable.
    if (!Array.isArray(checks) || checks.length === 0) throw new Error(`Criterion ${index + 1} needs non-empty coverageChecks`);
    const owned = new Set((results ? results[index]?.evidence : item.evidence) || []);
    const names = new Set();
    for (const check of checks) {
      if (typeof check?.assertion !== 'string' || !check.assertion.trim() || names.has(key(check.assertion))
          || !outcomes.has(check.outcome) || !Array.isArray(check.evidence)) {
        throw new Error(`Criterion ${index + 1} has an invalid or duplicate coverage check`);
      }
      names.add(key(check.assertion));
      if (['Passed', 'Failed'].includes(check.outcome) && check.evidence.length === 0) {
        throw new Error(`Criterion ${index + 1} coverage check needs direct evidence`);
      }
      if (check.evidence.some(file => typeof file !== 'string' || !owned.has(file))) {
        throw new Error(`Criterion ${index + 1} coverage check references evidence outside its own result`);
      }
    }
    const derived = ['Blocked', 'Failed', 'Unverified', 'Passed'].find(outcome => checks.some(check => check.outcome === outcome));
    if (item.outcome !== derived) throw new Error(`Criterion ${index + 1} outcome must be ${derived}, derived from coverageChecks`);
    // A reviewer may add missing assertions, but cannot silently drop a planned
    // tester branch. It must independently assess that branch's actual evidence.
    for (const check of results?.[index]?.coverageChecks || []) {
      if (!names.has(key(check.assertion))) throw new Error(`Criterion ${index + 1} review omitted a tester coverage assertion`);
    }
  }
}
