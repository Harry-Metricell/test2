# TEST2 Evidence Review Brief

Execute immediately; do not summarise this brief.

Read exactly these local files and no others: `status/handoffs.json`; the selected handoff's `inputs.results`; `inputs.generated`; `tickets/<KEY>/criteria.md`; `tickets/<KEY>/report.md`; and screenshots only from the specified evidence folder. Treat the handoff paths as the only permitted repository inputs.

Use the supplied first eligible `evidence_review` handoff in deterministic `handoffId` order. Do not use Jira, ticket numbers from the task prompt, local folder names, or arbitrary ticket selection. If none exists, return one compact JSON no-op with `noOp: true` and all required fields present. If QA status is `Evidence Reviewed`, skip it.

Read only the selected ticket criteria, results, concise report, and screenshots at:
`C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\screenshots\`

Before creating a report, verify that this folder exists and contains at least one non-empty PNG. If it is missing or empty, assess every criterion as `Blocked`, set `overallOutcome` to `Blocked`, set `qaStatus` to `Ready for Testing`, set `reportPath` to an empty string, explain that screenshots are required, and write the required `review-output.json` immediately. Do not create or render a Word report in this case. This returns the ticket to the tester through the status bundler.

Assess every criterion independently. Use `Passed` only with direct screenshot evidence, `Failed` only with direct contradictory evidence, `Blocked` when required evidence/report generation is unavailable, and `Unverified` when evidence is inconclusive. Never infer Passed from text alone.

If PNG evidence exists, create the Word report from:
`C:\Users\harry.piper\OneDrive - Metricell Ltd\Test Document TemplateV2.docx`

Save the final DOCX only to:
`C:/Users/harry.piper/Documents/ChatGPT/Test2-github/.agent-staging/<handoffId>/report.docx`.

Render the DOCX exactly once after generation. If `C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE` exists, run this repository script exactly; do not use `soffice.exe` or another fallback:
`powershell -NoProfile -ExecutionPolicy Bypass -File C:/Users/harry.piper/Documents/ChatGPT/Test2-github/scripts/render-docx-to-pdf.ps1 -InputDocx C:/Users/harry.piper/Documents/ChatGPT/Test2-github/.agent-staging/<handoffId>/report.docx -OutputPdf C:/Users/harry.piper/Documents/ChatGPT/Test2-github/.agent-staging/<handoffId>/report.pdf`
Verify that `report.pdf` exists and is non-empty, render every PDF page to temporary PNGs with the available PDF renderer, and inspect every page for clipping, overlap, missing text, or other layout errors. If Word is unavailable, set `qaStatus` to `Awaiting Evidence Review` and explain that Word is unavailable; do not substitute `soffice.exe`. If PDF generation or inspection fails, set `qaStatus` to `Awaiting Evidence Review`. Write temporary render PNGs only inside the staging folder or system temp.

The JSON must contain: `handoffId`, `ticket`, `criterionOutcomes`, `overallOutcome`, `reportPath`, `evidenceFolder`, `qaStatus`, `noOp`, `reason`. Set `qaStatus` to `Evidence Reviewed` only after successful report verification. If report generation, PDF creation, or inspection fails after valid PNG evidence exists, set `qaStatus` to `Awaiting Evidence Review` and explain the blocker.

Do not create helper scripts or unrelated files in the repository; use only the staging folder or temporary system files. Do not modify permanent ticket files, criteria, Jira, credentials, or authentication state. Return one compact JSON object only with exactly those fields. No markdown or commentary.
