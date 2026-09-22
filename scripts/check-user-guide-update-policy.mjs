import fs from 'node:fs';
import path from 'node:path';

const policyPath = path.resolve(process.argv[2] || 'config/user-guide-update-policy.json');
const fail = message => { throw new Error(`User-guide update policy: ${message}`); };
let policy;
try { policy = JSON.parse(fs.readFileSync(policyPath, 'utf8')); }
catch (error) { fail(`${policyPath} is not valid JSON: ${error.message}`); }

if (policy?.schema !== 'v4-user-guide-update-policy.v1') fail('schema must be v4-user-guide-update-policy.v1');
if (policy.enabled !== true || policy.onlyForPassedEvidenceReviews !== true) fail('updates must remain enabled and limited to passed evidence reviews');
if (policy.requireVerifiedTicketEvidence !== true) fail('updates must require verified ticket evidence');
if (policy.highlightColour !== 'yellow' || policy.preserveExistingGuideContent !== true) fail('updates must preserve existing content and highlight changes in yellow');
if (!Array.isArray(policy.allowChangeTypes) || policy.allowChangeTypes.length === 0 || policy.allowChangeTypes.some(value => !['add', 'amend'].includes(value))) fail('allowChangeTypes must contain only add and amend');
console.log(JSON.stringify({ ok: true, policy: path.relative(process.cwd(), policyPath) }, null, 2));
