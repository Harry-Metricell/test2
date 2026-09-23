/** Flatten Jira's Atlassian Document Format without splitting inline text nodes. */
export function flattenAdf(node, parentType = '') {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) {
    const separator = parentType === 'paragraph' || parentType === 'heading' ? '' : '\n';
    return node.map((child) => flattenAdf(child, parentType)).filter(Boolean).join(separator);
  }
  if (node.type === 'text') return node.text || '';

  const own = node.text || '';
  const children = node.content ? flattenAdf(node.content, node.type) : '';
  if (node.type === 'bulletList' || node.type === 'orderedList') return children;
  if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'listItem') {
    return [own, children].filter(Boolean).join(' ').trim();
  }
  return [own, children].filter(Boolean).join(' ').trim();
}

/** Extract the Jira acceptance-criteria section from its flattened description. */
export function acceptanceCriteria(descriptionText) {
  const marker = /Acceptance Criteria:\s*/i.exec(descriptionText);
  if (marker) {
    const afterMarker = descriptionText
      .slice(marker.index + marker[0].length)
      .split(/\n+/)
      .map((line) => line.replace(/\\n/g, '\n').replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);
    // Jira's flattened rich text contains all later sections. Criteria end at
    // the object-change section; headings beyond that are not test criteria.
    const end = afterMarker.findIndex((line) => /^Object Change List:/i.test(line));
    return end === -1 ? afterMarker : afterMarker.slice(0, end);
  }

  const concise = descriptionText.replace(/\s+/g, ' ').trim();
  if (!concise || concise.length > 500 || !/\b(should|must|shall|able to)\b/i.test(concise)) return [];

  const sentences = concise.split(/(?<=[.!?])\s+/).map((line) => line.trim()).filter(Boolean);
  const actions = sentences.filter((line) => !/\b(?:should|must|shall) work\.?$/i.test(line));
  return actions.length ? actions : [concise];
}

