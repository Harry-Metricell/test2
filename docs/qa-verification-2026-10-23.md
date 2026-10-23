# Controlled tester-quality verification

User-authorised 23 October 2026. Source VM2ST remains read-only. Existing reports/findings are preserved; no acceptance criteria are weakened. Public report publication approval already covers TEST2-79–92. This is a work tracker, not a source of QA outcomes.

## Release procedure

Keep tester-side tickets in Jira **TESTING IN PROGRESS** while held. This status is a holding queue here, not a claim that a worker is active. The imported status must be READY FOR TESTING before a tester/reviewer can run. Only release one or two tickets, and keep config/qa-verification-batch.json aligned. Bundler excludes held testers/reviewers even if someone prematurely marks them Ready. No automatic next-pair release.

For an authorised fresh retest, move only the selected ticket through **To Do → READY FOR TESTING**, then request and verify a fresh import. The importer archives the old cycle/report and assigns the new cycle; do not manually clear history, counters, evidence or qa-cycle.json. TESTING IN PROGRESS → READY alone intentionally does not reset attempts. Retain browser ownership and sequential testing. Launch the coordinator with its standard read-brief message only.

First pair: **TEST2-79 and TEST2-89**. Import verified successful on 23 October 2026 at 12:38:13 Europe/London: run 39947398383, request 5c21097b-f7a0-4edb-9382-09391032df9c. Live queue contains exactly these two test handoffs with evidenceCoverageVersion 1:

- TEST2-79: cycle-003, handoff-TEST2-79-cycle-003-test-attempt-001.
- TEST2-89: cycle-002, handoff-TEST2-89-cycle-002-test-attempt-001.

Previous PDFs and editable Word reports were verified preserved in their respective cycle-002/cycle-001 archives. Both are queued, not claimed tested; coordinator dispatch remains the next step. GitHub Regression Tests run 39947235633 succeeded for implementation commit 61822e73. After their reports, record exact cycle/handoff, review outcome and remaining coverage gaps here before choosing a new pair. User authorisation is required for changing the released pair.

## Ticket checklist

| Ticket | Verification work | Disposition |
| --- | --- | --- |
| 79 | Readable complete Download summary; verify absence scope; recover tool interaction errors without false success. Earlier host interruption left criteria 7–16 unexecuted. | First pair |
| 80 | Reassess criterion 3's each-result coverage consistently with 81. Keep previous nine-pass record historical, not silently rewritten. | Held |
| 81 | Reconcile HTTP/Ping results in a bounded permitted genuine scope; Video Streaming needs genuine data separately. | Held; data work deferred |
| 82 | Preserve reported loading failure and missing no-data contract. Correct future preservation of pre-existing panels. | Leave To Do; user bug returned |
| 83 | Historical Service points 500; later Service success elsewhere means availability needs a fresh scoped check, not an assumed pass. | Deferred; unchanged Jira |
| 84 | Identify actual Automobile Building feature/prerequisite; never substitute Surveyor. | Deferred; unchanged Jira |
| 85 | Historical Download points 500; later retrieval worked elsewhere. | Deferred; unchanged Jira |
| 86 | Historical Upload points 500; later retrieval worked elsewhere. | Deferred; leave To Do |
| 87 | Historical Call points 500; later retrieval worked elsewhere. | Deferred; unchanged Jira |
| 88 | Inspect Automobile's nested MS Teams Call type, not only catalogue text search. | Held |
| 89 | Inspect Automobile's nested MS Teams Call type; do not inspect Surveyor as a substitute. Capture reachable actual states or truthful prerequisites. | First pair |
| 90 | Full preservation/isolation comparisons; visible final sorting column/order; exact colours distinct from boundary fixtures. Retain confirmed forbidden-NSA finding and genuine calculation/Service fixture blockers. | Held |
| 91 | Reviewable expected frequency configuration; complete form and actual device-group condition. Preserve product contradictions separately from missing permissions. | Held |
| 92 | Second-layer comparisons, required editor/reset properties, details-open layout. Check real nested Call options before repeating the old single-field assumption; retain missing authoritative regression baselines. | Held |

## Implementation verification

- New tester/reviewer handoffs declare evidenceCoverageVersion 1. Each criterion carries explicit coverageChecks and criterion-owned evidence; publisher rejects inconsistent declared checks/outcomes.
- Worker/reviewer briefs require full canonical branch coverage, visible settled captures and consistent each/every standards. No structural validator can prove natural-language checklist completeness or replace independent image review.
- Browser host outages cannot be prevented by prompt changes. Preserve truthful partial output and ownership, and distinguish infrastructure interruption from application failure.
- Regression checks cover coverage contracts, legacy compatibility, evidence ownership, two-ticket hold enforcement, generation and publisher integration. These checks do not establish successful browser execution; first-pair final reports remain the acceptance gate.
