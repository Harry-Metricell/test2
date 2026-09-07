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

Inspect the page PNGs. If the renderer is missing or fails, return `Blocked`; do not use Word or repeated fallbacks.

After successful review and report verification, return the compact JSON summary. Do not update GitHub status from the fresh reviewer task: fresh-task safety controls may reject that state mutation even when the GitHub API is available. The coordinator will read the completed summary and, only after successful verification, update the assigned `tickets/<KEY>/status.json` through the authorised GitHub file API using the current SHA and the default branch (omit `branch`), then read it back.

Do not modify criteria, results, reports, Jira, credentials, authentication state, or unrelated files. Return one final compact JSON summary containing the ticket, per-criterion outcomes, overall outcome, report path, evidence folder, and blockers.
