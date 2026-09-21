import fs from 'node:fs';
import path from 'node:path';

const policyPath = path.resolve(process.argv[2] || 'config/user-guide-impact-policy.json');
const fail = message => { throw new Error(`User-guide impact policy: ${message}`); };
let policy;
try {
  policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
} catch (error) {
  fail(`${policyPath} is not valid JSON: ${error.message}`);
}

if (policy?.schema !== 'v4-user-guide-impact-policy.v1') fail('schema must be v4-user-guide-impact-policy.v1');
if (typeof policy.enabled !== 'boolean') fail('enabled must be true or false');
if (policy.onlyForPassedEvidenceReviews !== true) fail('onlyForPassedEvidenceReviews must remain true');
if (!Array.isArray(policy.decisions) || policy.decisions.length !== 2 || !policy.decisions.includes('not_needed') || !policy.decisions.includes('update_required')) {
  fail('decisions must be exactly not_needed and update_required');
}
if (policy.requireAffectedSectionWhenUpdateRequired !== true || policy.requireReason !== true) {
  fail('affected section and reason requirements must remain enabled');
}

console.log(JSON.stringify({ ok: true, policy: path.relative(process.cwd(), policyPath), enabled: policy.enabled, onlyForPassedEvidenceReviews: true }, null, 2));
