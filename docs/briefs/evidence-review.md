# TEST2 Evidence Review Brief

Review exactly the supplied TEST2 ticket and no other ticket.

Read only the supplied `criteria.md`, `results.json`, `status.json`, concise report, screenshot manifest/screenshots, and DOCX template. Read `ticket.json` only if necessary context is missing.

Compare every source criterion with actual `steps_taken`, `actual_result`, and direct screenshots. Use `Passed` only with direct supporting evidence, `Failed` only with direct contradictory evidence, `Blocked` when required review inputs or report generation are unavailable, and `Unverified` when evidence is inconclusive.

Keep screenshots and the original concise report. Generate one DOCX, verify its structure and embedded screenshots, render it once after generation, and inspect that render. Delete only temporary working copies. After successful verification update only the assigned `status.json` to `qaStatus: Evidence Reviewed`.

Do not search the repository, modify Jira, or touch unrelated files. In a fresh chat read this brief once, then return one final JSON summary only.
