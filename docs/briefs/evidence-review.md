# TEST2 Evidence Review Brief

For a shared-component story, verify the tested consumer against the complete ticket's scope refinement and exclusions. Being in the correct module is insufficient when the source names particular supported layers. Do not carry a verdict from an excluded or unsupported consumer into an in-scope result. A current deployed implementation can explain behaviour but does not, by itself, establish a backend response contract or an independent pre-change regression baseline.

## Select one live handoff

Execute immediately; do not summarise this brief. Fetch live GitHub main `status/handoffs.json`. Verify the supplied handoff ID, ticket, evidence_review action and handoffVersion; do not select another ticket. Otherwise select the first eligible evidence_review by handoffId. If absent/changed or already Evidence Reviewed, return a compact chat-only no-op without staging output.

Read only its remote inputs.results, inputs.generated, tickets/<KEY>/ticket.json, tickets/<KEY>/criteria.md, plus the selected testing context below. Always compare the generated checklist with the complete selected source ticket; the checklist is not independent authority for adding requirements. Retry failed fetches once after a short wait; never use Jira, arbitrary tickets, stale local inputs or conversation history.

## Locate the exact attempt

Read `inputs.testingContext` when present. Require the selected tester results' `testedModule` to match its human-confirmed targetModule, and verify that the screenshots and observed request paths actually show that module/layer. Linked-story titles and old setup notes do not override the resolved source parent scope. An unresolved conflict or evidence from a substitute module is Blocked, not an Automobile pass or product defect. Do not reuse cycles listed as supersededEvidence. Include top-level `testedModule` equal to the targetModule in review-output.json; the publisher rejects missing or conflicting module provenance.

Read PNGs only from TEST2_EVIDENCE, or the current user's `%USERPROFILE%\Documents\V4-QA-evidence`. Append the live handoff's `inputs.evidenceFolder` exactly: cycle-001 uses <KEY>/screenshots/attempt-NNN/; later cycles use <KEY>/cycles/<cycleId>/screenshots/attempt-NNN/. Expand environment variables to absolute paths. Cross-check the remote result references and selected attempt/cycle. For legacy handoffs without that input, derive the exact attempt from result references, never the highest existing folder. Never combine attempts/cycles or read the screenshot-folder root. Refetch the exact handoff ID/version before staging; a replaced cycle is a chat-only stale no-op, not a review to publish.

Verify each referenced PNG exists and is non-empty. Missing files block the affected criterion with its exact filename in reason. If the folder is missing/empty or has no non-empty PNG, assess every criterion Blocked and still stage output. For wholly untested runs with all tester outcomes Blocked and empty evidence lists, preserve the actual blocker reason and state that no browser evidence was captured/testing could not be completed. Only that case permits a no-image blocker PDF; claimed-but-missing captures remain publication errors.

PNG references point to local evidence, not GitHub file URLs. When a result supplies supportingEvidence, also read only its explicitly referenced private files under the same ticket/cycle/attempt in TEST2_EVIDENCE. Require paths shaped cycles/<cycleId>/supporting/attempt-NNN/criterion-N-<description>.csv or .json (omit cycles/<cycleId>/ for cycle-001), verify SHA-256 before using them, reject traversal/symlinks and never read arbitrary exports or credentials. Compare CSV data with its genuine selected-record response, including units; a narrative receipt alone is insufficient. A matching private CSV/response pair is direct export evidence and need not be displayed inside a screenshot. A complete criterion-owned DOM inventory can corroborate control absence; screenshots must still identify the actual view. Do not print private file contents in chat or publish raw data.

## Load relevant proof rules

Select references from the complete source criteria and supplied evidence, not the tester verdict. Read every applicable reference before assessment; when uncertain, read it. Several may apply. These are required proof rules, not optional standards. Do not load unrelated references or previous reports.

- For criteria about maps, record coverage, numeric colours or available fields, read [review-map-data](references/review-map-data.md).
- For criteria about controls, tables, navigation, defaults, preservation or restoration, read [review-interactions](references/review-interactions.md).
- For loading/no-data/error criteria or any result labelled `SIMULATED UI STATE:`, read [review-exception-states](references/review-exception-states.md).

## Assess every criterion

Read each unchanged source/input once for the selected commit and handoffVersion. Inspect every criterion and all evidence needed for its source obligations, recording a compact private assessment as you go. Reopen an already assessed image only for an unresolved identity, readability, comparison or coverage question, changed bytes or a correction; do not repeatedly read whole folders or results just to compose the final receipt. A cached assessment never substitutes another criterion's evidence or an earlier attempt. Refetch the live handoff before staging as required.

Use Passed only with direct screenshot evidence, Failed with direct contradiction, Unverified when evidence is inconclusive, and Blocked when required evidence/environment is unavailable. Never infer Passed from notes alone.

Apply these same proof requirements to corrections and reassessments. A human clarification defines the expected behaviour; it does not prove the application performed it. Never upgrade an earlier uncertain/blocked behaviour to Passed solely from an old narrative, an ARIA flag, the revised interpretation or successful publication. Require the actual qualifying evidence sequence and retain any unresolved gap. Review every criterion independently rather than copying the tester's verdict or a previous review.

For handoffs with evidenceCoverageVersion 1, each criterionOutcomes item includes coverageChecks [{assertion, outcome, evidence}]. Independently derive the checks from the canonical criterion, retain every tester assertion (same assertion text), and add any omitted required branch. Assess actual evidence, not the tester's outcome; reference only that criterion's remote results[].evidence paths. Passed/Failed checks need direct evidence. Derive the criterion outcome in the precedence Blocked, Failed, Unverified, Passed. For older tester results without checks, construct the checks yourself; do not reject historical source results merely for lacking the new field. The publisher checks structure, not semantic completeness.

An older HTTP 500 or catalogue-only absence finding is historical, not proof of current availability. Do not convert it into a present product defect or reuse unrelated successful evidence as its pass. If the required parent/nested choices were not inspected, disclose incomplete discovery rather than asserting the module is unavailable. Keep genuine fixture, permission and response-contract blockers separate from reachable actions the tester simply did not complete.

Always check this selected ticket's remote `tickets/<KEY>/ticket.json` for original scope and qualifiers, including "available"/"reported" summary information. Do not require unreturned optional values or waive mandatory fields. Apply explicit human requirementClarifications from the selected testing context only within their stated scope; do not invent or generalise them. Separately required conditional branches still need their own matching fixture and evidence. If the canonical checklist omitted a material source qualifier or contains an unresolved requirement conflict, name our criteria issue explicitly; do not silently rewrite the checklist, manufacture a pass or misclassify it as missing data.

Read verified testing-context notes outside the canonical checklist. Check that the evidence uses the stated module/layer, not a similarly named substitute. A missing-feature blocker based solely on catalogue text search does not prove absence when the feature may be a nested parent-layer configuration option. Preserve uncertainty if the required module was not inspected; do not assume a product defect or a pass from another module.

An automation interaction error or missing comparison baseline is not proof of an application defect. Assess the recovered criterion-owned sequence if available; otherwise use Unverified or Blocked as above. The report displays Unverified as Failed but excludes it from confirmed-defect counts.

Inspect actual visible states, not capture filenames or claimed tool success. An after-action image may still show an unsettled transition. Identify the later criterion-owned image that proves the required state, and note any discrepancy; if none proves it, mark Unverified rather than trusting the filename.

For URL requirements, also require the result's browser-derived browserUrl and verify the required host/destination; page screenshots cannot prove the browser address.

## Stage output and finish

Write `.agent-staging/<handoffId>/review-output.json` and verify it exists/non-empty. Required fields: handoffId, handoffVersion, ticket, criterionOutcomes, overallOutcome, reportPath, evidenceFolder, qaStatus, noOp and reason. Copy live handoffVersion exactly; set noOp false for a completed assessment.

criterionOutcomes contains exactly one item per criterion with criterion, outcome and reason. Use exact criterion text or a one-based numeric identifier. Never leave outcomes empty.

Derive overallOutcome in this precedence: Blocked if any criterion is Blocked; otherwise Failed if any Failed; otherwise Unverified if any Unverified; otherwise Passed. qaStatus is "Blocked" only for overall Blocked; otherwise "Evidence Reviewed". Set reportPath to the empty string and evidenceFolder to the exact expanded absolute selected attempt folder.

The publisher creates/verifies the report and rejects inconsistent or incomplete output. Do not create, render, inspect or upload Word/PDF documents, edit criteria/ticket files/Jira, or handle credentials/authentication state.

Report presentation: keep the full simulation scope, contract, record identity, recovery and cleanup audit in the structured review reason. The deterministic report builder may display a short method and decisive visible result once in the criterion assessment; it must not repeat the full audit in actual-result and screenshot boxes or hide unresolved limitations. Opening testing limitations describe material test constraints, not explanations of Y/N columns or defect-count bookkeeping. This display policy never changes an outcome or the evidence required for it.

Name the decisive criterion-owned captures, including selected-result/detail states captured after a file called final when those are the actual proof. The report retains named proof, before/after comparisons and unfamiliar states, moving only clearly unrelated setup to supporting evidence. Ordinary assessments already shown in Actual Results are not repeated; distinct limitations, recovery and simulation notes remain. Table detail enlargements supplement the original full screenshots and must derive from their actual changed pixels, not guessed UI coordinates. Fewer printed setup images never means less required testing.

Do not repeat routine execution dates/times in Actual Results when the report already records the test date. Retain dates and times that prove sorting, filters, chronology or record identity; never remove a relevant value merely to shorten the report.

Return only a compact receipt with handoffId, ticket and staged true; for no-op/failure, a compact reason. Never repeat outcomes or the payload, and do not narrate routine calls; host-required updates must be one short sentence.


