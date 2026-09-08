# TEST2 QA Testing Brief

Execute immediately; do not summarise this brief.

Read exactly these local files and no others: `status/handoffs.json`; the selected handoff's `inputs.criteria`; `inputs.ticketJson`; and `inputs.status`. Treat the handoff paths as the only permitted ticket inputs.

Select the first eligible open `test_ticket` handoff in deterministic `handoffId` order from the local project's `status/handoffs.json`. Do not use Jira, ticket numbers from the task prompt, local folder names, or arbitrary ticket selection. If none exists, return one compact JSON no-op with `noOp: true` and all required fields present. If QA status is `Awaiting Evidence Review` or `Evidence Reviewed`, skip it.

Use the authenticated V4 browser. If sign-in asks for an email, enter `harry.piper@metricell.com` and click Continue. Never enter a password or alter authentication state. Test every criterion independently. Use `Passed` only with direct evidence, `Failed` only with direct contradictory evidence, `Blocked` for missing/external dependencies, and `Unverified` for inconclusive evidence. Record actual `steps_taken`.

Save screenshots only to:
`C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\screenshots\`

Write the concise Word/report evidence only to:
`C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\reports\`

Write one temporary output file to:
`C:\Users\harry.piper\Documents\V4-QA-evidence\.staging\<handoffId>\test-output.json`

The JSON must contain: `handoffId`, `ticket`, `qaStatus`, `results`, `conciseReport`, `reportPath`, `evidenceFolder`, `noOp`, `reason`. `conciseReport` is the original short Markdown report for GitHub; do not put screenshots or DOCX content in it. Set `qaStatus` to `Awaiting Evidence Review` after finalising the result, including blocked runs. Do not modify permanent ticket files, criteria, Jira, or authentication state.

Return one compact JSON object only with exactly those fields. No markdown or commentary.
