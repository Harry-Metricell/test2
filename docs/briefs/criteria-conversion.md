# TEST2 Criteria Conversion Brief

Execute immediately; do not summarise this brief.

Use the GitHub connector to fetch the live `main` branch file `status/handoffs.json` before selecting work; do not use a local checkout copy for queue selection. Then fetch only the selected handoff's remote `inputs.ticketJson`, `status/generated/<KEY>.json`, and `tickets/<KEY>/criteria.md`. Treat the handoff paths as the only permitted ticket inputs. If a remote fetch fails, retry once after a short wait; never guess from stale local files.

Select the first eligible open `criteria_conversion` handoff in deterministic `handoffId` order from the freshly fetched live GitHub `status/handoffs.json`. Do not use Jira, ticket numbers from the task prompt, local folder names, or arbitrary ticket selection. If none exists, return one compact JSON no-op with `noOp: true` and all required fields present.

Read only the selected handoff inputs. For every selected ticket, inspect the original Jira description and the existing `criteria.md` together. If existing criteria are present, validate that every action, object, condition, and expected result is faithful to the Jira source; preserve them when correct and rewrite only when needed. If criteria are missing, write new criteria. Use one unchecked bullet per distinct state-changing/user action. Never combine separate actions. Put the expected observable result in the same bullet. Observations belong with the action they evidence. Preserve source meaning; if the Jira source is genuinely ambiguous or insufficient, set `qaStatus` to `Blocked` and explain why.

Write one temporary output file to:
`C:/Users/harry.piper/Documents/ChatGPT/Test2-github/.agent-staging/<handoffId>/criteria-output.json`

The JSON must contain: `handoffId`, `ticket`, `criteriaMarkdown`, `qaStatus`, `noOp`, `reason`. Set `qaStatus` to `Ready for Testing` only when valid criteria are produced; set it to `Blocked` when valid criteria cannot be produced. Do not modify permanent ticket files, Jira, screenshots, reports, credentials, or authentication state.

Return one JSON object only with exactly those six fields. No markdown or commentary.
