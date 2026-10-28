# Controlled tester-quality verification

User-authorised 23 October 2026. Source VM2ST remains read-only. Existing reports/findings are preserved; no acceptance criteria are weakened. Public report publication approval already covers TEST2-79–92. This is a work tracker, not a source of QA outcomes.

## Release procedure

Current release, authorised by the user on 27 October 2026: **TEST2-79 and TEST2-92**. The previous 83/87 pair has completed and is held. Only 79/92 are released for tester/reviewer work; all other tickets in TEST2-79–92 remain held. Use importer-owned fresh cycles and retain all previous reports/history. The user has accepted TEST2-80 as passed and deferred TEST2-82 pending development work; neither is included in this retest pair. The 85/86 reassessments remain 8 Passed and 2 Blocked each, pending their recorded developer inputs.

Keep tester-side tickets in Jira **TESTING IN PROGRESS** while held. This status is a holding queue here, not a claim that a worker is active. The imported status must be READY FOR TESTING before a tester/reviewer can run. Only release one or two tickets, and keep config/qa-verification-batch.json aligned. Bundler excludes held testers/reviewers even if someone prematurely marks them Ready. No automatic next-pair release.

For an authorised fresh retest, move only the selected ticket through **To Do → READY FOR TESTING**, then request and verify a fresh import. The importer archives the old cycle/report and assigns the new cycle; do not manually clear history, counters, evidence or qa-cycle.json. TESTING IN PROGRESS → READY alone intentionally does not reset attempts. Retain browser ownership and sequential testing. Launch the coordinator with its standard read-brief message only.

Historical first pair: **TEST2-79 and TEST2-89**. Import verified successful on 23 October 2026 at 12:38:13 Europe/London: run 39947398383, request 5c21097b-f7a0-4edb-9382-09391032df9c. At that import the queue contained these two test handoffs with evidenceCoverageVersion 1:

- TEST2-79: cycle-003, handoff-TEST2-79-cycle-003-test-attempt-001.
- TEST2-89: cycle-002, handoff-TEST2-89-cycle-002-test-attempt-001.

Previous PDFs and editable Word reports were verified preserved in their respective cycle-002/cycle-001 archives. Those handoffs have since completed; they are not the current release. GitHub Regression Tests run 39947235633 succeeded for implementation commit 61822e73. Use live cycle-scoped records for current outcomes and gaps. User authorisation is required for changing the released pair.

## Ticket checklist

| Ticket | Verification work | Disposition |
| --- | --- | --- |
| 79 | Focused 28 October repair: 15 Passed, 1 Failed. Download/Upload matching-record reconciliation and all seven sorting rows verified in bounded genuine scopes. Criterion 10 still fails: Upload chart tooltip omits required units. | Corrected PDF/Word; original cycle-005 attempt-002 results/history and retry counters retained |
| 80 | User accepted the existing Passed review. Preserve it and its reports. | Passed; held from further testing |
| 81 | Reconcile HTTP/Ping results in a bounded permitted genuine scope; Video Streaming needs genuine data separately. | Held; data work deferred |
| 82 | Preserve reported loading failure and missing no-data contract. Correct future preservation of pre-existing panels. | Leave To Do; user bug returned |
| 83 | Focused 28 October follow-up: 8 Passed, 1 Blocked. Harry accepted neighbour placement and demonstrated sorting/filtering scope. Genuine no-neighbour, 3G and SA records were checked; only unavailable-details testing still needs a fixture or agreed response contract. | User marked done on 28 October; no further retesting. Corrected report and original cycle/results/history retained |
| 84 | Identify actual Automobile Building feature/prerequisite; never substitute Surveyor. | Deferred; unchanged Jira |
| 85 | Reassessed 27 October: 8 Passed, 2 Blocked. Summary availability and disabled zero-duration presentation cleared from existing evidence. Criteria 6 and 9 need the inputs below; no new attempt or counter reset. | Held; updated PDF/Word published; earlier review and original tester history preserved |
| 86 | Reassessed 27 October: 8 Passed, 2 Blocked. Summary, disabled zero-duration presentation and repaired loading/recovery evidence cleared. Loading follow-up shows the genuine chart and all 28 recovered rows matching baseline, with exact handler removal and no pending requests. Criteria 6 and 9 need the inputs below. | Held; updated PDF/Word published; earlier review and original tester history preserved |
| 87 | Cycle-003 reviewed: 1 Passed, 3 Failed, 2 Blocked, 1 Unverified. Source VM2ST-110 checked read-only on 27 October confirms timeline technology, filterable samples and Serving Cell wording. Follow-up demonstrated readable destination time through the built-in detached detail view; five columns sorted correctly in both directions across 33 samples. Service, Site Distance and Speed still need varied values. No sample filters found after header/table/footer inspection. Zero-duration and unavailable-detail branches still need fixtures/contracts. | Completed; focused follow-up supplement records new evidence; original independent review retained |
| 88 | Inspect Automobile's nested MS Teams Call type, not only catalogue text search. | Held |
| 89 | Correct nested type was reached; retain the inspected-scope data blocker without substituting Surveyor. | Held; previous release completed |
| 90 | Full preservation/isolation comparisons; visible final sorting column/order; exact colours distinct from boundary fixtures. Retain confirmed forbidden-NSA finding and genuine calculation/Service fixture blockers. | Held |
| 91 | Reviewable expected frequency configuration; complete form and actual device-group condition. Preserve product contradictions separately from missing permissions. | Held |
| 92 | Source VM2ST-116 rechecked read-only 27 October: current consumers are HTTP Browsing, Ping and Video Streaming. Earlier Call-based observations are not verdicts for these consumers. Correct context before checking isolation, second-layer comparisons, editor/reset behaviour and details-open layout. Multi-field end-to-end coverage still needs a genuine consuming layer and measurements; exact regression checks need a versioned expected baseline. | Released 27 October for an importer-owned fresh cycle; after 79 |

## Next checks after the 85 and 86 reassessments

The user authorised release of **TEST2-79, then TEST2-92** on 27 October: one
browser tester at a time and at most two tickets released. Change only these
TEST2 tickets through To Do to READY FOR TESTING and verify the importer archives
the earlier cycle before creating the new handoffs. Retain 80 as accepted and
82 as returned for development. No other ticket is authorised for automatic
release by this instruction.

1. **79 — complete the interrupted Download/Upload coverage.** Source VM2ST-104
   was checked read-only on 27 October. Genuine positive-duration records and
   earlier zero-duration examples are available as navigation hints. Complete
   the missing tables, units, null-error presentation, sorting/filtering and
   loading/error isolation. Re-establish each fixture and capture its own
   evidence. Verify the records against the genuine responses in the inspected
   authorised scope; do not claim a complete database or another user's access.
2. **92 — check the correct legend consumers.** Start with populated HTTP
   Browsing and Ping, with another layer retained for independent comparisons.
   Inspect Video Streaming's fixed-category and minimum-only numeric rules
   where reachable; an empty map does not prove marker classification. Check
   sibling isolation, draft Cancel/Close, Save leaving the editor open, numeric
   boundary validation, reset Save versus Cancel, linked-site/cell settings and
   resize with details open. Preserve real failures. Missing multi-field
   consumers or versioned baselines remain explicit prerequisites.

Defer 81/88/89 until matching Video Streaming/MS Teams data is identified. Keep
83's unavailable-detail prerequisite, 84's Building prerequisite,
87's filtering/varied-data gaps, and 90/91's product/configuration/access findings
separate; another blanket retry does not resolve them.

## Remaining prerequisites for 85 and 86

Focused investigation on 27 October started from the launcher in an owned tab
under the shared browser lease. It inspected the deployed Automobile detail code
and API Request Audit read-only. No request handler or response simulation was
installed. The owned tab was closed and its exact lease released; the original
GIS tab was left open. Audit provenance is retained in
`docs/qa-corrections/2026-10-27/transfer-prerequisites.json`.

**Criterion 6 — returned average metrics.** The deployed Download/Upload views
use a fixed summary field list, plus duration and point context. Inspection found
no Average Signal Strength, Average Signal Quality or Average SNR fields in that
renderer. This suggests an implementation gap as well as the missing fixture;
it is not a runtime failure verdict for a condition that has not been exercised.
The original source still explicitly requires the metrics only when returned.
Do not calculate replacements from samples or inject a successful response.

Developer input needed: identify the supported response fields and units for
the three averages, confirm the mapping into the Download/Upload summary and
their order immediately after the rate, and supply a genuine record returning
them with a date/time and map area. If that mapping is missing, fix it in V4 and
deploy it before a focused check. The QA repository does not contain V4's source.

**Criterion 9 — unavailable analysis.** The deployed client has a falsy-response
no-analysis branch and an empty-sample table message. These are distinct states;
neither establishes the server's actual unavailable-response contract. API
Request Audit exposes metadata/status, not response bodies. Its 24-hour filtered
view had 20 successful analysis calls, but HTTP 200 alone cannot establish any
response's contents. Prior bounded genuine records were populated.

Developer input needed: provide the authoritative status/body schema for
unavailable Download and Upload analysis, or a genuine reachable example. Then
capture the actual state, or use only the already-permitted scoped browser
simulation with that established contract, and verify genuine recovery/cleanup.
Do not treat a zero-duration disabled row as evidence for this separate branch.
No request for these inputs has been sent to anyone.

## Implementation verification

- 28 October TEST2-83 audit correction: preserved the earlier review and original
  cycle-004 results/history; criterion 4 is now Unverified (displayed as Failed
  without a confirmed defect). Added the missing detail-view assertions rather
  than discarding the proven selection-list checks. Report inputs retain every
  review-cited/coverage-referenced capture and the full original attempt remains
  available. Recognised numbered layer-setup captures move out of criterion
  proof only when the reviewer names decisive evidence; cited configuration,
  required baselines and unfamiliar states remain. Tester/reviewer briefs now
  distinguish selection lists from individual-record detail/sample tables.

- 28 October reviewer correction after the user challenged TEST2-85/86: disabled
  controls need a recorded normal activation sequence and settled before/after
  evidence; ARIA/tooltip observations alone cannot justify Passed. Named fields
  not exercised must be disclosed first in the criterion assessment, preserving
  source-qualified optionality. Corrections/reassessments use the same gates;
  human clarification is not execution evidence. Tester guidance now supplies
  the same proof. Existing reports/outcomes are not retroactively changed by
  this brief update; 85/86 remain in the user's To Do queue for follow-up.

- 27 October preparation: corrected TEST2-92's current consumer scope from the
  complete source refinement; added TEST2-79's genuine zero-duration navigation
  hints and missing-coverage focus. Tester/reviewer briefs now explicitly check
  named consumers and exclusions for shared-component stories. Current formal
  outcomes, original results, release configuration and cycle counters were not
  changed by this preparation.

- 27 October criteria correction for 85/86: original VM2ST-107/108 checked read-only; criterion 1's availability qualifier restored. Human clarification accepts disabled zero-duration rows as no-data, recorded in criterion 7 and each selected testing context. Previous criteria preserved outside cycle archives so the importer can still create cycle-003 archives normally on a later genuine rework transition. Worker briefs always cross-check the complete selected source ticket and honour only scoped, explicit human clarifications. No outcome, cycle, retry counter or queue release changed.

- After the user restored authentication on 27 October, the focused TEST2-87 investigation completed. The built-in detached detail window displayed the selected sample's full time and matching Service values. The entire 33-row DOM sequence verified both sort directions for Time, Call State, Site, Cell and Signal Strength. Three equal/missing-value columns remain inconclusive; sample filtering was not found. Original findings are retained with a dated report supplement rather than rewriting the completed attempt. New raw audit and PNGs are kept privately; no source Jira, backend state, cycle or retry count was changed. Owned tabs/layer were removed and the browser lease released; the changed map viewport was not restored exactly.

- 27 October follow-up: strengthened tester/reviewer instructions for readable sample-to-detail timestamp correlation, complete required-column sorting, table-specific filter discovery and chart-specific proof. Existing outcomes/reports remain unchanged until new evidence is reviewed. Browser investigation reached external Microsoft sign-in before any Automobile interaction; no new test output, attempt or cycle was created, and the investigation's own browser lease was released. Restore the configured test browser's signed-in session before the focused TEST2-87 evidence check; do not rerun the entire batch or manufacture no-data responses.

- New tester/reviewer handoffs declare evidenceCoverageVersion 1. Each criterion carries explicit coverageChecks and criterion-owned evidence; publisher rejects inconsistent declared checks/outcomes.
- Worker/reviewer briefs require full canonical branch coverage, visible settled captures and consistent each/every standards. No structural validator can prove natural-language checklist completeness or replace independent image review.
- Browser host outages cannot be prevented by prompt changes. Preserve truthful partial output and ownership, and distinguish infrastructure interruption from application failure.
- Regression checks cover coverage contracts, legacy compatibility, evidence ownership, two-ticket hold enforcement, generation and publisher integration. These checks do not establish successful browser execution; first-pair final reports remain the acceptance gate.

- 28 October TEST2-83 follow-up: 8 Passed and criterion 8 Blocked. Human acceptance for criteria 2/4 is distinguished from fresh browser proof for 3/5/6. Retained prior review and original attempt, added criterion-owned screenshots and verified the 23-page PDF against all 41 expected evidence images. No retry/cycle reset. Public release explicitly approved in the updater chat.

- 28 October TEST2-79 focused follow-up: resolved criteria 2, 3 and 12 with normal UI interactions, genuine returned membership and complete overlapping sorting captures. Report has 15 Passed and one product failure (criterion 10, missing tooltip units), 31 pages and 49 verified evidence images. No new automated attempt or cycle. Raw request audit stays private; public supporting summary records scope and complete sorting membership. Tester brief now requires complete settled visible-table evidence. Browser setup restored to its prior recorded configuration and owned lease released.
