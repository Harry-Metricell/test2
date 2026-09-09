# TEST2 Evidence Review Brief

Execute immediately; return one compact JSON object only. Do not summarise this brief.

Use the GitHub connector to fetch the live `main` branch file `status/handoffs.json` before selecting work; do not use a local checkout copy for queue selection. Then fetch only the selected handoff's remote `inputs.results`, `inputs.generated`, `tickets/<KEY>/criteria.md`, and `tickets/<KEY>/report.md`; read PNG screenshots only from `C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\screenshots\`. Do not use Jira, the task prompt's ticket number, arbitrary ticket selection, or other repository files.

Select the first eligible `evidence_review` handoff in deterministic `handoffId` order from the freshly fetched live GitHub queue. If a remote fetch fails, retry once after a short wait; never guess from stale local files. If none exists, return the required fields with `noOp: true`. If the selected ticket is already `Evidence Reviewed`, return a no-op.

If the screenshot folder is missing, empty, or contains no non-empty PNG, assess every criterion as `Blocked`, set `overallOutcome` and `qaStatus` to `Blocked`, set `reportPath` to ``, explain that screenshots are required, and write the output immediately.

Assess every criterion independently. Use `Passed` only with direct screenshot evidence, `Failed` only with direct contradictory evidence, `Unverified` when evidence is inconclusive, and `Blocked` when required evidence or the test environment was unavailable. Never infer `Passed` from text alone.

Do not create, render, inspect, or upload a DOCX/PDF. Do not modify criteria, ticket files, Jira, credentials, or authentication state. The local publisher builds and verifies the report after receiving this JSON. With valid PNG evidence, set `qaStatus` to `Evidence Reviewed` only if the review itself is complete; the publisher will change it to `Blocked` if report generation or verification fails.

The JSON must contain exactly: `handoffId`, `ticket`, `criterionOutcomes`, `overallOutcome`, `reportPath`, `evidenceFolder`, `qaStatus`, `noOp`, `reason`. `criterionOutcomes` must contain one item per criterion with `criterion`, `outcome`, and `reason`. Set `reportPath` to `` because the publisher creates the report. Do not include markdown or commentary.

