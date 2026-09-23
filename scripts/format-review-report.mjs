function markdownCell(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ').trim();
}

export function formatReviewReport(ticket, title, review, attempt) {
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
  lines.push('', `**Review summary:** ${markdownCell(review.reason)}`, '');
  return lines.join('\n');
}
