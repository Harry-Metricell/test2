# TEST2 Criteria Conversion Brief

Execute immediately; do not summarise this brief.

Use the GitHub connector to fetch the live `main` branch file `status/handoffs.json` before selecting work; do not use a local checkout copy for queue selection. Then fetch only the selected handoff's remote `inputs.ticketJson`, `status/generated/<KEY>.json`, and `tickets/<KEY>/criteria.md`. Treat the handoff paths as the only permitted ticket inputs. If a remote fetch fails, retry once after a short wait; never guess from stale local files.

If the coordinator message supplies a handoff ID and ticket, select that exact handoff after verifying it is live and matches the ticket; otherwise select the first eligible open `criteria_conversion` handoff in deterministic `handoffId` order from the freshly fetched live GitHub `status/handoffs.json`. Do not use Jira, ticket numbers from the task prompt, local folder names, or arbitrary ticket selection. If none exists, return one compact JSON no-op with `noOp: true` and all required fields present.

Read only the selected handoff inputs. For every selected ticket, read the entire original Jira ticket: summary, full description, acceptance criteria, issue/change details, scope, exclusions, and relevant notes. Read the existing `criteria.md` if it exists, but never treat its presence as proof that it is acceptable. Judge every criterion for fidelity to the full Jira source and for practical testability: it must describe one clear action or state, an observable expected result, the necessary condition or starting state, and no hidden or uncheckable assumption. Remove duplication, split combined actions, restore missing source requirements, and replace vague or non-testable criteria with clearer criteria that a browser tester can prove with screenshots. Write the improved criteria even when the existing file was poor. Informal, shorthand, incomplete, or missing acceptance-criteria formatting is not by itself a reason to block: when the summary and description identify a screen, feature, entry point, or user action, convert that intent into the smallest faithful testable criterion. Set `qaStatus` to `Blocked` only when the full Jira source contains no recoverable product behaviour or the requested outcome, scope, or starting state is genuinely impossible to infer; explain exactly what clarification is missing. This is a criteria-quality gate, not evidence review: do not inspect screenshots, test results, reports, or PDFs.

Write one temporary output file to:
`.agent-staging/<handoffId>/criteria-output.json`

The JSON must contain: `handoffId`, `ticket`, `criteriaMarkdown`, `qaStatus`, `noOp`, `reason`. Set `qaStatus` to `Ready for Testing` only when valid criteria are produced; set it to `Blocked` when valid criteria cannot be produced. Do not modify permanent ticket files, Jira, screenshots, reports, credentials, or authentication state.

Return one JSON object only with exactly those six fields. No markdown or commentary.
