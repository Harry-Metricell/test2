// Human-confirmed source provenance and scoped clarifications survive imports
// and QA cycles. They constrain interpretation, never prescribe a test outcome.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export function testingContextPath(key) {
  if (!/^\w+-\d+$/.test(key)) throw new Error('Invalid testing-context ticket');
  return `config/testing-context/${key}.json`;
}

export function readTestingContext(repo, key) {
  const file = path.join(repo, testingContextPath(key));
  if (!fs.existsSync(file)) return null;
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (value.schema !== 'v4-qa-testing-context.v1' || value.ticket !== key
      || !value.targetModule || !value.source?.key || !value.source?.parent?.key
      || value.resolution?.authority !== 'human') {
    throw new Error(`${key}: invalid or unconfirmed testing context`);
  }
  return value;
}

export function contextRevision(context) {
  return createHash('sha256').update(JSON.stringify(context)).digest('hex').slice(0, 12);
}

export function contextHandoff(handoff, context) {
  if (!handoff || !context) return handoff;
  const revision = contextRevision(context);
  return { ...handoff, handoffVersion: `${handoff.handoffVersion}:scope-${revision}`,
    inputs: { ...handoff.inputs, testingContext: testingContextPath(context.ticket) } };
}

export function contextualCriteria(markdown, context) {
  if (!context) return markdown;
  // Only replace the previous setup comment. Never rewrite checklist bullets.
  const original = markdown.replace(/<!-- Verified testing context[\s\S]*?-->\s*/g, '')
    .replace(/<!-- Testing scope:[\s\S]*?-->\s*/g, '');
  return `<!-- Testing scope: ${context.targetModule}. Read ${testingContextPath(context.ticket)} for source hierarchy and the human resolution of conflicting links. Do not substitute another module. -->\n${original}`;
}

export function requireTestedModule(context, output, results = null) {
  if (!context) return;
  if (output.testedModule !== context.targetModule) {
    throw new Error(`${context.ticket}: testedModule must be ${context.targetModule}; wrong-module evidence is not publishable`);
  }
  if (results && results.some(item => item.testedModule !== context.targetModule)) {
    throw new Error(`${context.ticket}: selected tester results have missing or conflicting module provenance`);
  }
}
