// A human-controlled verification hold, not another retry/attempt counter.
export function validateVerificationBatch(policy) {
  if (!policy || policy.enabled !== true) return policy;
  if (policy.maxReleased !== 2 || !Array.isArray(policy.released) || !Array.isArray(policy.held)
      || policy.released.length > policy.maxReleased) throw new Error('Verification batch allows at most two released tickets');
  const tickets = [...policy.released, ...policy.held];
  if (new Set(tickets).size !== tickets.length || tickets.some(key => !/^TEST2-\d+$/.test(key))) {
    throw new Error('Verification batch has duplicate or invalid ticket keys');
  }
  return policy;
}

export function verificationAllows(handoff, policy) {
  validateVerificationBatch(policy);
  return !handoff || policy?.enabled !== true || !policy.held.includes(handoff.ticket)
    || !['test_ticket', 'evidence_review'].includes(handoff.action);
}
