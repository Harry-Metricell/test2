function markdownCell(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ').trim();
}

export function formatReviewReport(ticket, title, review, attempt) {
  const outcomes = review.criterionOutcomes || [];
  const counts = Object.fromEntries(['Passed', 'Failed', 'Blocked', 'Unverified'].map(
    outcome => [outcome, outcomes.filter(item => item.outcome === outcome).length]
  ));
  const fallbackSummary = `${counts.Passed}/${outcomes.length} criteria passed; ${counts.Failed} failed, ${counts.Blocked} blocked, ${counts.Unverified} unverified. See the criterion results and PDF evidence.`;
  const lines = [
    `# ${ticket} Evidence Review`,
    '',
    `- **Ticket:** ${ticket}${title ? ` — ${markdownCell(title)}` : ''}`,
    `- **QA status:** ${markdownCell(review.qaStatus)}`,
    `- **Overall outcome:** ${markdownCell(review.overallOutcome)}`,
    `- **Evidence reviewed:** ${markdownCell(attempt)}`,
    '- **Report:** [Evidence report](report.pdf)',
    '',
    '## Criterion results',
    ''
  ];
  for (const [index, item] of review.criterionOutcomes.entries()) {
    lines.push(`${index + 1}. **${markdownCell(item.outcome)}:** ${markdownCell(item.criterion)}`);
    if (item.reason) lines.push(`   - ${markdownCell(item.reason)}`);
  }
  lines.push('', `**Review summary:** ${markdownCell(review.reason) || fallbackSummary}`, '');
  return lines.join('\n');
}
