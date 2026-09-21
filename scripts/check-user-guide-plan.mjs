import fs from 'node:fs';
import path from 'node:path';

const planPath = path.resolve(process.argv[2] || 'config/user-guide-plan.json');
const fail = message => { throw new Error(`User-guide plan: ${message}`); };

let plan;
try {
  plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
} catch (error) {
  fail(`${planPath} is not valid JSON: ${error.message}`);
}

if (plan?.schema !== 'v4-user-guide-plan.v1') fail('schema must be v4-user-guide-plan.v1');
for (const field of ['baselineTemplate', 'publishedGuide', 'captureRoot']) {
  if (typeof plan[field] !== 'string' || !plan[field].trim()) fail(`${field} must be a non-empty path`);
  if (path.isAbsolute(plan[field]) || plan[field].split(/[\\/]/).includes('..')) fail(`${field} must remain inside the repository`);
}
if (plan.updatePolicy?.highlightAddedOrChangedContent !== true || plan.updatePolicy?.highlightColour !== 'yellow') {
  fail('updatePolicy must require yellow highlighting for every added or changed item');
}
if (plan.updatePolicy?.preserveUnchangedContent !== true || plan.updatePolicy?.requireScreenshotForChangedFeature !== true) {
  fail('updatePolicy must preserve unchanged content and require screenshots for changed features');
}
if (!Array.isArray(plan.sections)) fail('sections must be an array');

const ids = new Set();
for (const [index, section] of plan.sections.entries()) {
  if (!section || typeof section !== 'object') fail(`section ${index + 1} must be an object`);
  if (typeof section.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(section.id)) fail(`section ${index + 1} has an invalid id`);
  if (ids.has(section.id)) fail(`section id ${section.id} is duplicated`);
  ids.add(section.id);
  if (typeof section.title !== 'string' || !section.title.trim()) fail(`section ${section.id} has no title`);
  if (typeof section.startUrl !== 'string' || !/^https:\/\//i.test(section.startUrl)) fail(`section ${section.id} needs an HTTPS startUrl`);
  if (!Array.isArray(section.requiredScreenshots) || section.requiredScreenshots.length === 0) fail(`section ${section.id} needs at least one required screenshot`);
  if (!Array.isArray(section.steps) || section.steps.length === 0 || section.steps.some(step => typeof step !== 'string' || !step.trim())) {
    fail(`section ${section.id} needs ordered, non-empty steps`);
  }
}

console.log(JSON.stringify({ ok: true, plan: path.relative(process.cwd(), planPath), sections: plan.sections.length, readyForTemplate: plan.sections.length === 0 }, null, 2));
