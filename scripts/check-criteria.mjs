import fs from 'node:fs';
import path from 'node:path';

const ticketsDir = 'tickets';
const errors = [];
const config = fs.existsSync('config/qa-workflow.json')
  ? JSON.parse(fs.readFileSync('config/qa-workflow.json', 'utf8'))
  : { criteriaValidation: { enabled: false } };
const validation = [];
const stopWords = new Set('about after again against all also and are because before being between but can could does each for from has have into its more most must not of on one only or other our should that the their then there these they this through to under was were when where which while with would you'.split(' '));
function words(text) {
  return new Set(String(text || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\\s+/).filter((word) => word.length >= 5 && !stopWords.has(word)));
}
function sourceText(ticket) {
  const description = ticket.fields?.description;
  if (!description) return '';
  const walk = (node) => Array.isArray(node) ? node.map(walk).join(' ') : (node?.text || '') + ' ' + (node?.content ? walk(node.content) : '');
  return walk(description);
}
function validateCriteria(key, ticket, criteria) {
  if (!config.criteriaValidation?.enabled) return;
  const source = words(sourceText(ticket));
  const generated = words(criteria);
  const missing = [...source].filter((word) => !generated.has(word));
  const result = { ticket: key, missingSourceTerms: missing, addedTerms: [], ambiguous: missing.length > 0, result: missing.length ? 'Review Required' : 'Valid' };
  validation.push(result);
  if (missing.length && config.criteriaValidation.failOnMissingSourceTerms) pending.push(key + ': criteria differs from Jira source; review required');
}

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
    if (!fs.existsSync(file)) errors.push(key + ': missing ' + file);
  }
  const criteriaFile = path.join(dir, 'criteria.md');
  if (fs.existsSync(criteriaFile)) {
    const criteria = fs.readFileSync(criteriaFile, 'utf8');
    const ticket = JSON.parse(fs.readFileSync(path.join(dir, 'ticket.json'), 'utf8').replace(/\\\\n/g, ''));
    const hasGeneratedMarker = [
      'Generated from Jira acceptance criteria',
      'Generated from Jira description',
      'Source: Jira description'
    ].some((marker) => criteria.includes(marker));
    if (!hasGeneratedMarker) {
      errors.push(key + ': criteria.md is missing its generated marker');
    }
    if (criteria.includes('\\n')) {
      errors.push(key + ': criteria.md contains literal \\n escapes instead of line breaks');
    }
    if (criteria.includes('No acceptance criteria extracted')) {
      if (pendingCriteria.has(key)) pending.push(key + ': awaiting criteria conversion');
      else errors.push(key + ': criteria.md still contains the unresolved generated placeholder');
    }
    const checklistLines = criteria.split(/\r?\n/).filter((line) => /^- \[ \] /.test(line));
    if (checklistLines.length === 0 && !criteria.includes('No acceptance criteria extracted')) {
      errors.push(key + ': criteria.md has no valid checklist bullets');
    }
  }
}

if (!fs.existsSync('status/handoffs.json')) errors.push('status/handoffs.json is missing');
if (config.criteriaValidation?.enabled) fs.writeFileSync('status/criteria-validation.json', JSON.stringify({ schema: 'v4-qa-criteria-validation.v1', validation }, null, 2) + '\\n');

console.log(JSON.stringify({ tickets: tickets.length, errors, pending, handoffs: handoffs.length }, null, 2));
if (errors.length) process.exit(1);
