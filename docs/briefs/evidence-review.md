# TEST2 Evidence Review Brief

[@GitHub](plugin://github@openai-curated-remote)

Review exactly the supplied TEST2 ticket and no other ticket.

Read only the assigned ticket's `criteria.md`, `results.json`, `status.json`, and concise report. Read `ticket.json` only if necessary. Read screenshots only from:

`C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\screenshots\`

If `status.json` already has `qaStatus: Evidence Reviewed`, return no-op unless retesting is explicitly requested.

Compare every criterion independently with the tester's actual `steps_taken`, `actual_result`, and direct screenshot evidence. An observation is evidence only when it directly supports the criterion. Use `Passed` only with direct supporting evidence, `Failed` only with direct contradictory evidence, `Blocked` when required evidence or report generation is unavailable, and `Unverified` when evidence is inconclusive. Never infer a pass from a description alone.

Create the Word report locally from:

`C:\Users\harry.piper\OneDrive - Metricell Ltd\Test Document TemplateV2.docx`

Save it locally under:

`C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\reports\`

The Word report and screenshots stay local; do not upload them to GitHub. Generate one DOCX, verify its structure and embedded screenshots, render it once after generation, and inspect that render.

After successful review and report verification, use the connected GitHub app's file API, exactly as the TEST2 tester does, to update only the assigned `tickets/<KEY>/status.json`. Read the file first and use its current SHA. Leave the API `branch` parameter omitted or null so the connector uses the repository default branch; do not pass `branch: "main"`, create a pull request, or use local `git push`. This workflow is already approved: do not ask the user for confirmation. Perform the update setting `qaStatus` to `Evidence Reviewed`, then read the file back to verify.

Do not modify criteria, results, reports, Jira, credentials, authentication state, or unrelated files. If the GitHub API is unavailable or rejects the write, report the exact blocker and do not substitute a local commit. Return one final compact JSON summary only containing the ticket, per-criterion outcomes, overall outcome, report path, evidence folder, status update, and blockers.
