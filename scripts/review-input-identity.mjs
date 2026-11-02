// A changed evidence set is fresh review work, not another worker replacement.
import { createHash } from 'node:crypto';
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
export function reviewInputHandoff(handoff, { results, criteria, context = null } = {}) {
  if (handoff?.action !== 'evidence_review') return handoff;
  if (!Array.isArray(results) || !results.length || typeof criteria !== 'string' || !criteria.trim()) throw Error('Review identity requires complete source results and criteria');
  const reviewInputHash = createHash('sha256').update(JSON.stringify(canonical({ results,
    criteria: criteria.replace(/\r\n/g, '\n').trim(), context }))).digest('hex');
  const suffix = `evidence-${reviewInputHash.slice(0, 12)}`;
  const scope = handoff.handoffVersion.match(/:scope-[a-f0-9]+$/)?.[0] || '';
  const baseVersion = (scope ? handoff.handoffVersion.slice(0, -scope.length) : handoff.handoffVersion).replace(/:evidence-[a-f0-9]{12}$/, '');
  return { ...handoff,
    handoffId: handoff.handoffId.replace(/-evidence-[a-f0-9]{12}$/, '') + '-' + suffix,
    handoffVersion: baseVersion + ':' + suffix + scope, reviewInputHash };
}
