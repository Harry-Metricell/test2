import fs from 'node:fs';
import path from 'node:path';

const ticketsDir = 'tickets';
const errors = [];
const pending = [];
const handoffs = fs.existsSync('status/handoffs.json')
  ? JSON.parse(fs.readFileSync('status/handoffs.json', 'utf8')).handoffs || []
  : [];
const pendingCriteria = new Set(handoffs
  .filter((handoff) => handoff.action === 'criteria_conversion')
  .map((handoff) => handoff.ticket));
const tickets = fs.existsSync(ticketsDir)
  ? fs.readdirSync(ticketsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((key) => fs.existsSync(path.join(ticketsDir, key, 'ticket.json')))
    .sort()
  : [];

for (const key of tickets) {
  const dir = path.join(ticketsDir, key);
  for (const required of ['ticket.json', 'criteria.md', 'status.json']) {
    const file = path.join(dir, required);
    if (!fs.existsSync(file)) errors.push(\`${key}: missing ${file}\`);
  }
  const criteriaFile = path.join(dir, 'criteria.md');
  if (fs.existsSync(criteriaFile)) {
    const criteria = fs.readFileSync(criteriaFile, 'utf8');
    if (!criteria.includes('Generated from Jira acceptance criteria') && !criteria.includes('Source: Jira description')) {
      errors.push(\`${key}: criteria.md is missing its generated marker\`);
    }
    if (criteria.includes('\\\\n')) {
      errors.push(\`${key}: criteria.md contains literal \\\\n escapes instead of line breaks\`);
    }
    if (criteria.includes('No acceptance criteria extracted')) {
      if (pendingCriteria.has(key)) pending.push(\`${key}: awaiting criteria conversion\`);
      else errors.push(\`${key}: criteria.md still contains the unresolved generated placeholder\`);
    }
    const checklistLines = criteria.split(/\\r?\\n/).filter((line) => /^- \\[ \\] /.test(line));
    if (checklistLines.length === 0 && !criteria.includes('No acceptance criteria extracted')) {
      errors.push(\`${key}: criteria.md has no valid checklist bullets\`);
    }
  }
}

if (!fs.existsSync('status/handoffs.json')) errors.push('status/handoffs.json is missing');

console.log(JSON.stringify({ tickets: tickets.length, errors, pending, handoffs: handoffs.length }, null, 2));
if (errors.length) process.exit(1);
