// A guide describes user goals, not the tester's mandatory return-to-start ritual.
// Apply only to new authoring outputs; do not invalidate historical records.
export function guideInstructionIssues(steps) {
  if (!Array.isArray(steps)) return ['Guide steps must be an array'];
  const qaRitual = /\brecorded initial\b|\brestore\b.{0,65}\b(?:initial|original) (?:state|setting)\b|\bfor (?:this|the) test\b|\b(?:test cleanup|acceptance criteri(?:on|a)|pass\/fail|capture (?:a )?screenshot)\b/i;
  return steps.flatMap((step, index) => typeof step === 'string' && qaRitual.test(step)
    ? [`Guide step ${index + 1} describes QA bookkeeping or cleanup rather than a user goal`] : []);
}
