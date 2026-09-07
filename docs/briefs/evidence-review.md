# TEST2 Evidence Review Brief

Review exactly the supplied TEST2 ticket and no other ticket.

Read only the assigned ticket's `criteria.md`, `results.json`, `status.json`, and concise report. Read `ticket.json` only if necessary. Read screenshots only from:

`C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\screenshots\`

If `status.json` already has `qaStatus: Evidence Reviewed`, return no-op unless retesting is explicitly requested.

Compare every criterion independently with the tester's actual `steps_taken`, `actual_result`, and direct screenshot evidence. An observation is evidence only when it directly supports the criterion. Use `Passed` only with direct supporting evidence, `Failed` only with direct contradictory evidence, `Blocked` when required evidence or report generation is unavailable, and `Unverified` when evidence is inconclusive. Never infer a pass from a description alone.

Create the Word report locally from:

`C:\Users\harry.piper\OneDrive - Metricell Ltd\Test Document TemplateV2.docx`

Save it locally under:

`C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\reports\`

The Word report and screenshots stay local; do not upload them to GitHub. Generate one DOCX only, verify its structure and embedded screenshots, render it once after generation, and inspect that render.

After successful review and report verification, update only the assigned `tickets/<KEY>/status.json` through the connected GitHub file API on `main`, setting `qaStatus` to `Evidence Reviewed`. Do not use local `git push`.

Do not modify criteria, results, reports, Jira, credentials, authentication state, or unrelated files. If the GitHub app is unavailable, make no repository write and report the blocker. Return one final compact JSON summary only containing the ticket, per-criterion outcomes, overall outcome, report path, evidence folder, status update, and blockers.
