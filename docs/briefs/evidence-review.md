# TEST2 Evidence Review Brief

Execute immediately; do not summarise this brief.

Use the supplied first eligible `evidence_review` handoff in deterministic `handoffId` order. Do not use Jira, ticket numbers from the task prompt, local folder names, or arbitrary ticket selection. If none exists, return one compact JSON no-op with `noOp: true` and all required fields present. If QA status is `Evidence Reviewed`, skip it.

Read only the selected ticket criteria, results, concise report, and screenshots at:
`C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\screenshots\`

Assess every criterion independently. Use `Passed` only with direct screenshot evidence, `Failed` only with direct contradictory evidence, `Blocked` when required evidence/report generation is unavailable, and `Unverified` when evidence is inconclusive. Never infer Passed from text alone.

Create the Word report from:
`C:\Users\harry.piper\OneDrive - Metricell Ltd\Test Document TemplateV2.docx`

Save the final report only to:
`C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\reports\`

Render it once with a unique temporary profile and inspect the rendered pages. Write one temporary output file to:
`C:\Users\harry.piper\Documents\V4-QA-evidence\.staging\<handoffId>\review-output.json`

The JSON must contain: `handoffId`, `ticket`, `criterionOutcomes`, `overallOutcome`, `reportPath`, `evidenceFolder`, `qaStatus`, `noOp`, `reason`. Set `qaStatus` to `Evidence Reviewed` only after successful report verification. If report generation, rendering, or inspection fails, set `qaStatus` to `Awaiting Evidence Review` and explain the blocker.

Do not modify permanent ticket files, criteria, Jira, credentials, or authentication state. Return one compact JSON object only with exactly those fields. No markdown or commentary.
