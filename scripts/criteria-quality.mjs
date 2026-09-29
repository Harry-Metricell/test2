/** Reject common tester constraints that cannot be established from browser evidence. */
export function criteriaQualityErrors(markdown) {
  const lines = String(markdown).split(/\r?\n/)
    .filter(line => /^- \[ \] /.test(line))
    .map(line => line.slice(6).replace(/[*_`]/g, '').trim());
  const errors = [];
  for (const [index, line] of lines.entries()) {
    const mutationInstruction = /\b(?:do not|don't|must not|should not)\s+(?:create|modify|change|delete|write|alter)\b.{0,100}\b(?:data|records?|database|audit)\b/i.test(line);
    const hiddenSideEffect = /\b(?:verify|confirm|ensure|check)\b.{0,70}\bno\s+(?:\w+[ -]){0,4}(?:data|records?|database|audit(?:\s+data)?)\b.{0,100}\b(?:creat(?:ed|ion)|modif(?:ied|ication)|chang(?:ed|e)|delet(?:ed|ion)|written|altered)\b/i.test(line);
    if (mutationInstruction || hiddenSideEffect) {
      errors.push(`Criterion ${index + 1} treats an unobservable data-change constraint as a browser acceptance criterion`);
    }
  }
  return errors;
}
