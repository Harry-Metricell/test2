/** A browser-server outage is retryable even if an older worker mislabels it. */
export function normalizeBrowserToolBlock(item) {
  const unavailable = item?.blockerCode === 'browser_tools_unavailable'
    || /configured Playwright MCP (?:server|browser tools) (?:was|were) (?:not available|unavailable)/i.test(String(item?.reason || ''));
  if (item?.outcome === 'Blocked' && Array.isArray(item.evidence) && item.evidence.length === 0 && unavailable) {
    return { ...item, blockerCode: 'browser_tools_unavailable', retryClass: 'transient' };
  }
  return item;
}

/** Only an explicit, wholly untested block may publish without browser PNGs. */
export function isNoEvidenceBlock(review, results) {
  return review?.overallOutcome === 'Blocked'
    && Array.isArray(review.criterionOutcomes) && review.criterionOutcomes.length > 0
    && review.criterionOutcomes.every(item => item.outcome === 'Blocked' && String(item.reason || '').trim())
    && Array.isArray(results) && results.length === review.criterionOutcomes.length
    && results.every(item => item.outcome === 'Blocked' && Array.isArray(item.evidence)
      && item.evidence.length === 0 && String(item.reason || '').trim());
}
