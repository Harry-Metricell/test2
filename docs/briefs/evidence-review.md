# TEST2 Evidence Review Brief

[@GitHub](plugin://github@openai-curated-remote)
[@Documents](plugin://documents@openai-primary-runtime)

Review exactly the supplied TEST2 ticket and no other ticket.

Read only the assigned ticket's `criteria.md`, `results.json`, `status.json`, and concise report. Read `ticket.json` only if necessary. Read screenshots only from:

`C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\screenshots\`

If `status.json` already has `qaStatus: Evidence Reviewed`, return no-op unless retesting is explicitly requested.

Compare every criterion independently with the tester's actual `steps_taken`, `actual_result`, and direct screenshot evidence. An observation is evidence only when it directly supports the criterion. Use `Passed` only with direct supporting evidence, `Failed` only with direct contradictory evidence, `Blocked` when required evidence or report generation is unavailable, and `Unverified` when evidence is inconclusive. Never infer a pass from a description alone.

Use the Documents plugin for DOCX creation, structural checks, and render inspection. Create the report from:

`C:\Users\harry.piper\OneDrive - Metricell Ltd\Test Document TemplateV2.docx`

Save it under:

`C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\reports\`

Keep the report and screenshots local; do not upload them. Copy the template to temporary work space, generate one DOCX, verify its structure and embedded screenshots, then render it once with:

`C:\Users\harry.piper\Documents\V4-QA-tools\LibreOfficePortable\App\libreoffice\program\soffice.exe`

Inspect the page PNGs. If the renderer is missing or fails, return `Blocked` and do not set `Evidence Reviewed`.

After successful review and report verification, the reviewer must update only the assigned `tickets/<KEY>/status.json` through the connected GitHub file API. Read it first, use its current SHA, omit the API `branch` parameter (or pass null), set `qaStatus` to `Evidence Reviewed`, then read it back to verify. This is a required reviewer action. Do not defer it to a coordinator, ask for confirmation, create a pull request, or use local `git push`.

Do not modify criteria, results, reports, Jira, credentials, authentication state, or unrelated files. If the GitHub API rejects the required status write, return `Blocked` with the exact error and leave the status unchanged. Return one final compact JSON summary containing the ticket, per-criterion outcomes, overall outcome, report path, evidence folder, status update, and blockers.
