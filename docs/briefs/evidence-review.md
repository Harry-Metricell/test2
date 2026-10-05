# TEST2 Evidence Review Brief

## Select one live handoff

Execute immediately; do not summarise this brief. Fetch live GitHub main `status/handoffs.json`. Verify the supplied handoff ID, ticket, evidence_review action and handoffVersion; do not select another ticket. Otherwise select the first eligible evidence_review by handoffId. If absent/changed or already Evidence Reviewed, return a compact chat-only no-op without staging output.

Read only its remote inputs.results, inputs.generated, tickets/<KEY>/criteria.md and tickets/<KEY>/report.md. Retry failed fetches once after a short wait; never use Jira, arbitrary tickets, stale local inputs or conversation history.

## Locate the exact attempt

Read PNGs only from TEST2_EVIDENCE, or the current user's `%USERPROFILE%\Documents\V4-QA-evidence`, under <KEY>/screenshots/attempt-NNN/. Expand environment variables to absolute paths. Derive attempt-NNN from the remote results' screenshots/attempt-NNN/<file>.png references; if there are no evidence paths, use only the highest numbered existing attempt folder. Never combine attempts or read the screenshot-folder root.

Verify each referenced PNG exists and is non-empty. Missing files block the affected criterion with its exact filename in reason. If the folder is missing/empty or has no non-empty PNG, assess every criterion Blocked and still stage output. For wholly untested runs with all tester outcomes Blocked and empty evidence lists, preserve the actual blocker reason and state that no browser evidence was captured/testing could not be completed. Only that case permits a no-image blocker PDF; claimed-but-missing captures remain publication errors.

PNG references point to local evidence, not GitHub file URLs.

## Assess every criterion

Use Passed only with direct screenshot evidence, Failed with direct contradiction, Unverified when evidence is inconclusive, and Blocked when required evidence/environment is unavailable. Never infer Passed from notes alone.

For URL requirements, also require the result's browser-derived browserUrl and verify the required host/destination; page screenshots cannot prove the browser address.

Defaults, before/after comparisons, persistence and absence-of-control claims require evidence of each relevant state. Configured-default claims additionally require an independent baseline; a changed value alone is insufficient. Missing baseline/state makes the criterion Unverified, with the gap named.

For sequences such as toggle, restore, close and reopen, require this criterion's own ordered screenshots and steps to show the complete journey. Never assemble a pass from separate criterion runs. Missing transitions are Unverified. Keep reasons concise and describe what evidence shows, not boilerplate about file presence or expected hosts.

## Stage output and finish

Write `.agent-staging/<handoffId>/review-output.json` and verify it exists/non-empty. Required fields: handoffId, handoffVersion, ticket, criterionOutcomes, overallOutcome, reportPath, evidenceFolder, qaStatus, noOp and reason. Copy live handoffVersion exactly; set noOp false for a completed assessment.

criterionOutcomes contains exactly one item per criterion with criterion, outcome and reason. Use exact criterion text or a one-based numeric identifier. Never leave outcomes empty.

Derive overallOutcome in this precedence: Blocked if any criterion is Blocked; otherwise Failed if any Failed; otherwise Unverified if any Unverified; otherwise Passed. qaStatus is "Blocked" only for overall Blocked; otherwise "Evidence Reviewed". Set reportPath to the empty string and evidenceFolder to the exact expanded absolute selected attempt folder.

The publisher creates/verifies the report and rejects inconsistent or incomplete output. Do not create, render, inspect or upload Word/PDF documents, edit criteria/ticket files/Jira, or handle credentials/authentication state.

Return only a compact receipt with handoffId, ticket and staged true; for no-op/failure, a compact reason. Never repeat outcomes or the payload, and do not narrate routine calls; host-required updates must be one short sentence.


