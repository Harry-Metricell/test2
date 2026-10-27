# Controlled tester-quality verification

User-authorised 23 October 2026. Source VM2ST remains read-only. Existing reports/findings are preserved; no acceptance criteria are weakened. Public report publication approval already covers TEST2-79–92. This is a work tracker, not a source of QA outcomes.

## Release procedure

Current release, authorised by the user on 26 October 2026: **TEST2-83 and TEST2-87**. The previous 85/86 pair completed with independently reviewed reports and is held pending follow-up. Only 83/87 are released for tester/reviewer work; all other tickets in TEST2-79–92 remain held. Use importer-owned fresh cycles and retain all previous reports/history. The user has accepted TEST2-80 as passed and deferred TEST2-82 pending development work; neither is included in this retest pair.

Keep tester-side tickets in Jira **TESTING IN PROGRESS** while held. This status is a holding queue here, not a claim that a worker is active. The imported status must be READY FOR TESTING before a tester/reviewer can run. Only release one or two tickets, and keep config/qa-verification-batch.json aligned. Bundler excludes held testers/reviewers even if someone prematurely marks them Ready. No automatic next-pair release.

For an authorised fresh retest, move only the selected ticket through **To Do → READY FOR TESTING**, then request and verify a fresh import. The importer archives the old cycle/report and assigns the new cycle; do not manually clear history, counters, evidence or qa-cycle.json. TESTING IN PROGRESS → READY alone intentionally does not reset attempts. Retain browser ownership and sequential testing. Launch the coordinator with its standard read-brief message only.

Historical first pair: **TEST2-79 and TEST2-89**. Import verified successful on 23 October 2026 at 12:38:13 Europe/London: run 39947398383, request 5c21097b-f7a0-4edb-9382-09391032df9c. At that import the queue contained these two test handoffs with evidenceCoverageVersion 1:

- TEST2-79: cycle-003, handoff-TEST2-79-cycle-003-test-attempt-001.
- TEST2-89: cycle-002, handoff-TEST2-89-cycle-002-test-attempt-001.

Previous PDFs and editable Word reports were verified preserved in their respective cycle-002/cycle-001 archives. Those handoffs have since completed; they are not the current release. GitHub Regression Tests run 39947235633 succeeded for implementation commit 61822e73. Use live cycle-scoped records for current outcomes and gaps. User authorisation is required for changing the released pair.

## Ticket checklist

| Ticket | Verification work | Disposition |
| --- | --- | --- |
| 79 | Readable complete Download summary; verify absence scope; recover tool interaction errors without false success. Earlier host interruption left unfinished checks. | Held; previous release completed |
| 80 | User accepted the existing Passed review. Preserve it and its reports. | Passed; held from further testing |
| 81 | Reconcile HTTP/Ping results in a bounded permitted genuine scope; Video Streaming needs genuine data separately. | Held; data work deferred |
| 82 | Preserve reported loading failure and missing no-data contract. Correct future preservation of pre-existing panels. | Leave To Do; user bug returned |
| 83 | Cycle-004 reviewed: 4 Passed, 1 Failed, 4 Blocked. Source VM2ST-105 checked read-only on 27 October: neighbours beneath serving details is explicit. Needs no-neighbour, 3G/5G SA and unavailable-detail fixtures. | Completed; final PDF/Word published; no automatic reset |
| 84 | Identify actual Automobile Building feature/prerequisite; never substitute Surveyor. | Deferred; unchanged Jira |
| 85 | Reviewed report and follow-up published; retain outstanding clarification/data requirements. | Held; previous release completed |
| 86 | Reviewed report published; retain prerequisite blockers and incomplete loading-recovery evidence. | Held; previous release completed |
| 87 | Cycle-003 reviewed: 1 Passed, 3 Failed, 2 Blocked, 1 Unverified. Source VM2ST-110 checked read-only on 27 October confirms timeline technology, filterable samples and Serving Cell wording. Repair readable destination-time evidence and remaining-column sort coverage; inspect table header menus before confirming absent filters. Zero-duration and unavailable-detail branches still need fixtures/contracts. | Completed; final PDF/Word published; focused follow-up awaits browser sign-in |
| 88 | Inspect Automobile's nested MS Teams Call type, not only catalogue text search. | Held |
| 89 | Correct nested type was reached; retain the inspected-scope data blocker without substituting Surveyor. | Held; previous release completed |
| 90 | Full preservation/isolation comparisons; visible final sorting column/order; exact colours distinct from boundary fixtures. Retain confirmed forbidden-NSA finding and genuine calculation/Service fixture blockers. | Held |
| 91 | Reviewable expected frequency configuration; complete form and actual device-group condition. Preserve product contradictions separately from missing permissions. | Held |
| 92 | Second-layer comparisons, required editor/reset properties, details-open layout. Check real nested Call options before repeating the old single-field assumption; retain missing authoritative regression baselines. | Held |

## Implementation verification

- 27 October follow-up: strengthened tester/reviewer instructions for readable sample-to-detail timestamp correlation, complete required-column sorting, table-specific filter discovery and chart-specific proof. Existing outcomes/reports remain unchanged until new evidence is reviewed. Browser investigation reached external Microsoft sign-in before any Automobile interaction; no new test output, attempt or cycle was created, and the investigation's own browser lease was released. Restore the configured test browser's signed-in session before the focused TEST2-87 evidence check; do not rerun the entire batch or manufacture no-data responses.

- New tester/reviewer handoffs declare evidenceCoverageVersion 1. Each criterion carries explicit coverageChecks and criterion-owned evidence; publisher rejects inconsistent declared checks/outcomes.
- Worker/reviewer briefs require full canonical branch coverage, visible settled captures and consistent each/every standards. No structural validator can prove natural-language checklist completeness or replace independent image review.
- Browser host outages cannot be prevented by prompt changes. Preserve truthful partial output and ownership, and distinguish infrastructure interruption from application failure.
- Regression checks cover coverage contracts, legacy compatibility, evidence ownership, two-ticket hold enforcement, generation and publisher integration. These checks do not establish successful browser execution; first-pair final reports remain the acceptance gate.
