# TEST2 Evidence Review Brief

## Select one live handoff

Execute immediately; do not summarise this brief. Fetch live GitHub main `status/handoffs.json`. Verify the supplied handoff ID, ticket, evidence_review action and handoffVersion; do not select another ticket. Otherwise select the first eligible evidence_review by handoffId. If absent/changed or already Evidence Reviewed, return a compact chat-only no-op without staging output.

Read only its remote inputs.results, inputs.generated, tickets/<KEY>/criteria.md and tickets/<KEY>/report.md. Retry failed fetches once after a short wait; never use Jira, arbitrary tickets, stale local inputs or conversation history.

## Locate the exact attempt

Read `inputs.testingContext` when present. Require the selected tester results' `testedModule` to match its human-confirmed targetModule, and verify that the screenshots and observed request paths actually show that module/layer. Linked-story titles and old setup notes do not override the resolved source parent scope. An unresolved conflict or evidence from a substitute module is Blocked, not an Automobile pass or product defect. Do not reuse cycles listed as supersededEvidence. Include top-level `testedModule` equal to the targetModule in review-output.json; the publisher rejects missing or conflicting module provenance.

Read PNGs only from TEST2_EVIDENCE, or the current user's `%USERPROFILE%\Documents\V4-QA-evidence`. Append the live handoff's `inputs.evidenceFolder` exactly: cycle-001 uses <KEY>/screenshots/attempt-NNN/; later cycles use <KEY>/cycles/<cycleId>/screenshots/attempt-NNN/. Expand environment variables to absolute paths. Cross-check the remote result references and selected attempt/cycle. For legacy handoffs without that input, derive the exact attempt from result references, never the highest existing folder. Never combine attempts/cycles or read the screenshot-folder root. Refetch the exact handoff ID/version before staging; a replaced cycle is a chat-only stale no-op, not a review to publish.

Verify each referenced PNG exists and is non-empty. Missing files block the affected criterion with its exact filename in reason. If the folder is missing/empty or has no non-empty PNG, assess every criterion Blocked and still stage output. For wholly untested runs with all tester outcomes Blocked and empty evidence lists, preserve the actual blocker reason and state that no browser evidence was captured/testing could not be completed. Only that case permits a no-image blocker PDF; claimed-but-missing captures remain publication errors.

PNG references point to local evidence, not GitHub file URLs.

## Assess every criterion

Use Passed only with direct screenshot evidence, Failed with direct contradiction, Unverified when evidence is inconclusive, and Blocked when required evidence/environment is unavailable. Never infer Passed from notes alone.

For handoffs with evidenceCoverageVersion 1, each criterionOutcomes item includes coverageChecks [{assertion, outcome, evidence}]. Independently derive the checks from the canonical criterion, retain every tester assertion (same assertion text), and add any omitted required branch. Assess actual evidence, not the tester's outcome; reference only that criterion's remote results[].evidence paths. Passed/Failed checks need direct evidence. Derive the criterion outcome in the precedence Blocked, Failed, Unverified, Passed. For older tester results without checks, construct the checks yourself; do not reject historical source results merely for lacking the new field. The publisher checks structure, not semantic completeness.

Use the same coverage standard for every ticket. "Each/every/all" requires a defined genuine scope and reconciliation of all supplied records, including cluster members; sampled visible markers do not prove each record selectable. Do not accept a sampled Service pass while rejecting the equivalent HTTP/Ping scope. A single marker cannot prove the absence of every other type: inspect the actual settled layer scope and identifiable displayed results, and state exactly what is established without inventing off-viewport requirements. Every named field must be readable, every required comparison/branch represented, and sort proof must show the settled target column and actual ordering rather than a click alone. Treat missing other-layer baselines, editor branches, details-tab states and exact-value proof as coverage gaps, not automatic product defects. Never add an unrelated branch not required by the canonical text.

An older HTTP 500 or catalogue-only absence finding is historical, not proof of current availability. Do not convert it into a present product defect or reuse unrelated successful evidence as its pass. If the required parent/nested choices were not inspected, disclose incomplete discovery rather than asserting the module is unavailable. Keep genuine fixture, permission and response-contract blockers separate from reachable actions the tester simply did not complete.

Assess the stated scope, not additional imagined coverage. An empty initial list is a valid baseline for unchanged-state and no-new-item assertions unless populated entries are required by the source or inherently by the asserted action. Verify its settled empty baseline and all asserted intermediate/final states; describe "remained empty", without claiming populated ordering coverage. A missing panel alone or failed loading does not prove emptiness; use Unverified for insufficient proof rather than inventing a missing-fixture blocker. Reordering/removal and explicit populated-list assertions still require entries. Visible catalogue restoration needs the initial visible viewport and matching final view, not off-screen entries unless the criterion requires them. Independent review may identify new gaps, but every gap must trace to the same canonical criterion and scope, not a new requirement.

If "available"/"reported" summary scope materially affects a fixture blocker, read this selected ticket's remote `tickets/<KEY>/ticket.json` to check the original qualifier. Do not require unreturned optional values or waive mandatory fields. Separately required conditional branches still need their own matching fixture and evidence. If the canonical checklist omitted a material source qualifier or contains an unresolved requirement conflict, name the criteria issue explicitly; do not silently rewrite the checklist, manufacture a pass or misclassify it as missing data.

Read verified testing-context notes outside the canonical checklist. Check that the evidence uses the stated module/layer, not a similarly named substitute. A missing-feature blocker based solely on catalogue text search does not prove absence when the feature may be a nested parent-layer configuration option. Preserve uncertainty if the required module was not inspected; do not assume a product defect or a pass from another module.

An automation interaction error or missing comparison baseline is not proof of an application defect. Assess the recovered criterion-owned sequence if available; otherwise use Unverified or Blocked as above. The report displays Unverified as Failed but excludes it from confirmed-defect counts.

Inspect actual visible states, not capture filenames or claimed tool success. An after-action image may still show an unsettled transition. Identify the later criterion-owned image that proves the required state, and note any discrepancy; if none proves it, mark Unverified rather than trusting the filename.

For URL requirements, also require the result's browser-derived browserUrl and verify the required host/destination; page screenshots cannot prove the browser address.

Defaults, before/after comparisons, persistence and absence-of-control claims require evidence of each relevant state. Configured-default claims additionally require an independent baseline; a changed value alone is insufficient. Missing baseline/state makes the criterion Unverified, with the gap named.

For sequences such as toggle, restore, close and reopen, require this criterion's own ordered screenshots and steps to show the complete journey. Never assemble a pass from separate criterion runs. Missing transitions are Unverified. Keep reasons concise and describe what evidence shows, not boilerplate about file presence or expected hosts.

For unchanged map/layer claims, inspect the original unobscured baseline and restored final state, including every list-scroll capture needed to see the complete list. Name the decisive baseline/action/final filenames in the criterion reason. For repeated edits, distinguish the specific first/second/final sequence being asserted from earlier setup; describe that decisive sequence rather than reciting all setup. The publisher must retain comparison baselines beneath their criterion; unrelated setup belongs in the compact supporting appendix or full local attempt, not in place of the proof.

Treat “remains the same” and “clearing restores the original” as preservation/restoration comparisons, not just final-state assertions. When preservation applies during searching, inspect the intermediate search state too. For a single unsaved Username cancellation, identify both the entered-value capture and the reopened empty-field capture; the publisher pairs the decisive states beneath the criterion. Do not shorten repeated edits or omit any state required by the assertion.

## Review controlled exception states

Results labelled `SIMULATED UI STATE:` are browser-local UI checks, not proof of real backend success or a naturally occurring server error. Require the tester's safe endpoint/method, selected record, injected condition, contract provenance, criterion-owned initial/transition/final evidence, recovery and verified cleanup. Preserve `SIMULATED UI STATE:` and the specific limitation in each affected criterionOutcomes reason, even when Passed, so the PDF discloses the method.

Accept a simulation only for an explicit loading/no-data/error UI criterion on the configured development host. Normal successful behaviour, backend integration, missing modules and permissions cannot pass through simulation. Confirm the tested module, panel and request match the canonical criterion; a detail-analysis panel does not automatically prove the entire point-detail dialog. A failed measurement is not a failed detail request. For no-data, require an actual empty response or project API documentation/schema establishing the empty-response contract; arrays emptied from a populated response are not sufficient. Missing scope or contract is Blocked, not an assumed pass.

Check visible loading before genuine recovery, the correct no-data/error message, and any required absence of stale details using that criterion's distinct previously loaded record and selected target identity. Base summary data for the current record may legitimately remain while its analysis panel loads. Missing comparison or recovery evidence is Unverified; direct contradictory UI behaviour is Failed. Unverified cleanup is Blocked and must be disclosed. Never infer Passed solely from interception logs or the tester's notes, and never remove the simulation disclosure to make the report look like an end-to-end backend test.

## Stage output and finish

Write `.agent-staging/<handoffId>/review-output.json` and verify it exists/non-empty. Required fields: handoffId, handoffVersion, ticket, criterionOutcomes, overallOutcome, reportPath, evidenceFolder, qaStatus, noOp and reason. Copy live handoffVersion exactly; set noOp false for a completed assessment.

criterionOutcomes contains exactly one item per criterion with criterion, outcome and reason. Use exact criterion text or a one-based numeric identifier. Never leave outcomes empty.

Derive overallOutcome in this precedence: Blocked if any criterion is Blocked; otherwise Failed if any Failed; otherwise Unverified if any Unverified; otherwise Passed. qaStatus is "Blocked" only for overall Blocked; otherwise "Evidence Reviewed". Set reportPath to the empty string and evidenceFolder to the exact expanded absolute selected attempt folder.

The publisher creates/verifies the report and rejects inconsistent or incomplete output. Do not create, render, inspect or upload Word/PDF documents, edit criteria/ticket files/Jira, or handle credentials/authentication state.

Report presentation: keep the full simulation scope, contract, record identity, recovery and cleanup audit in the structured review reason. The deterministic report builder may display a short method and decisive visible result once in the criterion assessment; it must not repeat the full audit in actual-result and screenshot boxes or hide unresolved limitations. Opening testing limitations describe material test constraints, not explanations of Y/N columns or defect-count bookkeeping. This display policy never changes an outcome or the evidence required for it.

Name the decisive criterion-owned captures, including selected-result/detail states captured after a file called final when those are the actual proof. The report retains named proof, before/after comparisons and unfamiliar states, moving only clearly unrelated setup to supporting evidence. Ordinary assessments already shown in Actual Results are not repeated; distinct limitations, recovery and simulation notes remain. Table detail enlargements supplement the original full screenshots and must derive from their actual changed pixels, not guessed UI coordinates. Fewer printed setup images never means less required testing.

Do not repeat routine execution dates/times in Actual Results when the report already records the test date. Retain dates and times that prove sorting, filters, chronology or record identity; never remove a relevant value merely to shorten the report.

Return only a compact receipt with handoffId, ticket and staged true; for no-op/failure, a compact reason. Never repeat outcomes or the payload, and do not narrate routine calls; host-required updates must be one short sentence.


