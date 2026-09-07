# TEST2 Evidence Review Brief

[@GitHub](plugin://github@openai-curated-remote)
[@Documents](plugin://documents@openai-primary-runtime)

Review only the supplied TEST2 ticket. Do not create another task.

Read only that ticket's `criteria.md`, `results.json`, `status.json`, concise report, and local screenshots at:
`C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\screenshots\`

If `qaStatus` is `Evidence Reviewed`, return no-op unless retesting is explicit.

Assess every criterion independently against the tester's actual `steps_taken`, `actual_result`, and direct screenshot evidence. Observations count only when they directly support the criterion. Use:
- `Passed`: direct supporting evidence
- `Failed`: direct contradictory evidence
- `Blocked`: required evidence or report generation unavailable
- `Unverified`: evidence inconclusive

Never infer Passed from text alone. Do not modify criteria, results, Jira, credentials, authentication state, or unrelated tickets.

Create one report from:
`C:\Users\harry.piper\OneDrive - Metricell Ltd\Test Document TemplateV2.docx`

Save it to:
`C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\reports\`

Use the Documents plugin for DOCX creation and structural checks. Embed the relevant screenshots, check for leftover template placeholders, then render the completed DOCX once with:
`C:\Users\harry.piper\Documents\V4-QA-tools\LibreOfficePortable\App\libreoffice\program\soffice.exe`
Inspect the rendered page PNGs. If generation, embedding, rendering, or inspection fails, return `Blocked` and do not change status.

After successful verification, complete the status update yourself now:
1. Fetch `tickets/<KEY>/status.json` from `main`.
2. Replace only `qaStatus` with `Evidence Reviewed`.
3. Immediately invoke the GitHub file-update API (`github_update_file`) using the fetched current file SHA and the default branch (omit `branch` or pass null).
4. Fetch the file again and verify the read-back.

This status write is a required execution step, not a request for permission. Do not ask for confirmation, say Pending, defer it, create a coordinator/publisher task, open a PR, or use local git. If the GitHub API itself rejects the write, return `Blocked` with the exact error and leave status unchanged.

Return one compact JSON object only:
`{ticket, criterionOutcomes, overallOutcome, reportPath, evidenceFolder, statusUpdate, blockers}`
