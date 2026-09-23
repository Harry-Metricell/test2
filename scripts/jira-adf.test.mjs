import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acceptanceCriteria, flattenAdf } from './jira-adf.mjs';

test('Jira rich-text inline nodes stay inside their acceptance criterion', () => {
  const description = {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Verify the browser can return to the V4 launcher after opening a module.' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Acceptance Criteria:' }] },
      {
        type: 'orderedList',
        content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The V4 launcher displays the Agentic AI module card and its Open control.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [
            { type: 'text', text: 'Selecting Open on Agentic AI displays the Agentic AI module page at ' },
            { type: 'text', text: '/agentic-ai', marks: [{ type: 'code' }] },
            { type: 'text', text: ' without a load error.' }
          ] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [
            { type: 'text', text: 'Using the browser Back control returns to ' },
            { type: 'text', text: '/launcher', marks: [{ type: 'code' }] },
            { type: 'text', text: ', where the module cards are visible and usable.' }
          ] }] }
        ]
      }
    ]
  };

  const flattened = flattenAdf(description);
  const criteria = acceptanceCriteria(flattened);
  assert.equal(criteria.length, 3);
  assert.deepEqual(criteria, [
    'The V4 launcher displays the Agentic AI module card and its Open control.',
    'Selecting Open on Agentic AI displays the Agentic AI module page at /agentic-ai without a load error.',
    'Using the browser Back control returns to /launcher, where the module cards are visible and usable.'
  ]);
});

