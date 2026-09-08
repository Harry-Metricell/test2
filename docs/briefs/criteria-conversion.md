# TEST2 Criteria Conversion Brief

Execute immediately; do not summarise this brief.

Read exactly these local files and no others: `status/handoffs.json`; the selected handoff's `inputs.ticketJson`; `status/generated/<KEY>.json`; and `tickets/<KEY>/criteria.md`. Treat the handoff paths as the only permitted ticket inputs.

Select the first eligible open `criteria_conversion` handoff in deterministic `handoffId` order from the local project's `status/handoffs.json`. Do not use Jira, ticket numbers from the task prompt, local folder names, or arbitrary ticket selection. If none exists, return one compact JSON no-op with `noOp: true` and all required fields present.

Read only the selected handoff inputs. Convert the ticket source into `criteria.md` content with one unchecked bullet per distinct state-changing/user action. Never combine separate actions. Put the expected observable result in the same bullet. Observations belong with the action they evidence. Preserve source meaning; if extraction is unreliable, output one unchecked bullet stating that criteria could not be extracted.

Write one temporary output file to:
`C:/Users/harry.piper/Documents/ChatGPT/Test2-github/.agent-staging/<handoffId>`

The JSON must contain: `handoffId`, `ticket`, `criteriaMarkdown`, `qaStatus`, `noOp`, `reason`. Set `qaStatus` to `Ready for Testing` only when valid criteria are produced. Do not modify permanent ticket files, Jira, screenshots, reports, credentials, or authentication state.

Return one JSON object only with exactly those six fields. No markdown or commentary.
