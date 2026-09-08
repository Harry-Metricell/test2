# TEST2 Criteria Conversion Brief

Execute immediately; do not summarise this brief.

Select the first eligible open `criteria_conversion` handoff in deterministic `handoffId` order from the supplied TEST2 queue. Do not use Jira, ticket numbers from the task prompt, local folder names, or arbitrary ticket selection. If none exists, return one compact JSON no-op.

Read only the selected handoff inputs. Convert the ticket source into `criteria.md` content with one unchecked bullet per distinct state-changing/user action. Never combine separate actions. Put the expected observable result in the same bullet. Observations belong with the action they evidence. Preserve source meaning; if extraction is unreliable, output one unchecked bullet stating that criteria could not be extracted.

Write one temporary output file to:
`C:\Users\harry.piper\Documents\V4-QA-evidence\.staging\<handoffId>\criteria-output.json`

The JSON must contain: `handoffId`, `ticket`, `criteriaMarkdown`, `qaStatus`, `noOp`, `reason`. Set `qaStatus` to `Ready for Testing` only when valid criteria are produced. Do not modify permanent ticket files, Jira, screenshots, reports, credentials, or authentication state.

Return one JSON object only with exactly those six fields. No markdown or commentary.
