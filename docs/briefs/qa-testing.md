# TEST2 QA Testing Brief

## Testing-cycle identity

Copy the live handoff's exact ID, handoffVersion and cycleId. Do not reconstruct them or reuse another cycle's stage folder. Before staging output, refetch the live queue; if the exact ID/version is gone, stop with a chat-only stale-handoff receipt. Clean up only your own temporary changes and release your browser lease. Never publish an earlier cycle's result into a newer cycle. The publisher copies staged PNGs to the selected cycle's evidence path; keep using `.agent-staging/<handoffId>/screenshots/` for capture.

## Select one live handoff

Execute immediately; do not summarise this brief. Fetch live GitHub main `status/handoffs.json`. If a handoff ID and ticket are supplied, verify that exact handoff's ticket, test_ticket action and handoffVersion; do not select another ticket. Otherwise select the first eligible test_ticket by handoffId. If none exists, it changed, or QA status is Awaiting Evidence Review/Evidence Reviewed, return a compact chat-only no-op without staging output.

Read only its remote inputs.criteria, inputs.ticketJson and inputs.status. Retry a failed fetch once after a short wait; never substitute local snapshots, Jira or conversation history. One handoff is one attempt; the publisher assigns permanent attempt numbers.

## Browser and authentication

Before any browser tool call, acquire the shared browser with `node scripts/tester-browser-lease.mjs --acquire <handoffId>` in the synchronized Desktop checkout. Require `acquired: true` and retain its returned token. If `acquired: false`, wait 30 seconds and retry without opening/navigating the browser, staging a result, or consuming an attempt. Never remove or expire another tester's lease. If the lease command is unavailable or denied, do not touch the browser; report the actual capability error rather than bypassing ownership.

Hold the lease for the whole attempt, including all criteria and cleanup. In a finally step after the output is safely staged, run `node scripts/tester-browser-lease.mjs --release <handoffId> <token>`. Only release your own token. If execution is interrupted, preserve the lease for coordinator reconciliation. Do not open or navigate a browser for a busy-lease no-op. Playwright's `--isolated` flag does not provide a private session per chat.

Use the configured Playwright MCP for all interactions and PNG evidence on the same page. Discover installed browser tools before declaring them unavailable. If absent, mark affected results Blocked with blockerCode "browser_tools_unavailable", retryClass "transient" and the actual tool error. Still stage required JSON; do not invent images or use another browser.

Start the run and every independent criterion with browser_navigate to exactly `https://o2intelligence-v4-dev.metricell.com/launcher`. Wait for the visible launcher and capture that criterion's initial state before interacting. An already-open destination module is not a valid start. If the launcher is unavailable, block rather than test from a destination page.

The MCP launcher uses saved private authentication; its page hook may recover the approved V4 email-and-Continue redirect. Never enter credentials, operate sign-in controls or change authentication state. If sign-in appears, wait briefly and navigate to the launcher once more. If recovered, restart the affected criterion from its initial state; if still unauthenticated or an external identity-provider page appears, report the actual blocker.

Read browser identity once through Playwright browser evaluation. Prefer `navigator.userAgentData.getHighEntropyValues(['fullVersionList'])`, selecting the actual browser brand/version, not placeholder brands; otherwise read `navigator.userAgent`. Record observed browserName and browserVersion per result. Do not open settings, install tools, assume Chrome or claim a full version from a reduced user agent. If unavailable, use null and note the metadata limitation; this alone does not block testing.

## Execute and capture evidence

Test every criterion independently. Identify its required visible states before acting. Record actual steps_taken, observed results and blockers, not intended actions.

Use only prerequisites stated by the complete ticket/criteria or inherently required by the asserted action. An empty initial list is a valid baseline for unchanged-state and no-new-item assertions unless populated entries are required. Positively establish the settled empty state, capture its own baseline, intermediate and final states, and report "remained empty" rather than claiming populated ordering was exercised. A missing panel alone, loading failure or inaccessible list is not proof of emptiness. Reordering/removal or an explicit populated-list assertion still needs suitable entries; never waive that prerequisite or create data without authorisation. Do not block solely because an unchanged list has zero entries, and do not borrow another criterion's fixture or images. Match visible-viewport versus complete-list scope exactly.

For each criterion:

1. Save its own criterion-N-initial.png at the launcher before the first interaction.
2. Save unique criterion-specific PNGs before and after every meaningful state-changing action. After acting, wait for the expected visible transition to settle and verify it before saving the after image; a completed tool call or filename does not prove the state changed. If the state does not settle, record the actual blocker/failure rather than a successful action. Use descriptive names such as criterion-2-before-close.png and criterion-2-after-close.png. Do not capture redundant scrolling, waits or unchanged clicks.
3. Perform required toggle/restore/close/reopen sequences continuously within this criterion. Do not borrow another criterion's images, baseline or a previous run.
   For unchanged map/layer assertions, capture the unobscured original map and complete layer list before opening a dialog, then the restored state after closing it; include additional list-scroll captures if needed. Name these comparison captures `criterion-N-baseline-map.png` / `criterion-N-baseline-layers.png` and the final assertion clearly. For repeated edits, name each edit/cancel/reopen phase distinctly (first, second, final); earlier phases remain setup unless this criterion explicitly tests them. Do not omit required transitions to shorten a report.
4. Save criterion-N-final.png at the decisive assertion, before cleanup, browser Back, return to launcher or the next criterion. A launcher image cannot prove destination controls. If final shows cleanup, recapture the asserted state or mark Unverified, never Passed from notes alone.
5. At that same final state, record the actual current browserUrl. Do not reuse the starting URL or another criterion's URL. Verify any required destination/return URL exactly; a mismatch cannot pass. Page screenshots do not capture browser chrome, so URL claims require this browser-derived value.
6. Restore test-created selections, filters, favourites, maps, panels and data where possible without altering unrelated state. Record incomplete restoration in reason or blockers. Capture cleanup separately, not as final evidence.

Use browser_take_screenshot with type "png", scale "css" and relative filename `<handoffId>/screenshots/<unique-name>.png`. Its working directory is the checkout's ignored .agent-staging, so files belong to `.agent-staging/<handoffId>/screenshots/`. Never use absolute screenshot filenames, tab.screenshot(), OS capture or chat-only images. Never copy evidence into permanent ticket/attempt folders or reuse another handoff's staging folder.

Initial and final PNGs must be separate captures/files even if unchanged. Verify each save exists and is non-empty before continuing. Before staging output, verify all references are readable, inside this handoff's staging folder and owned only by their criterion. Passed, Failed and Unverified require their own initial, transition and final evidence. Missing, unreadable, unverified, out-of-folder or reused evidence makes that criterion Blocked: identify the exact path/error. For Blocked criteria, capture the visible blocker if reachable; otherwise explain why no PNG was possible. Text, screenshot IDs and chat images never replace saved PNGs.

## Controlled exception-state testing

For an explicit loading, unavailable-details/no-data or failed-load criterion, a browser-only simulation is permitted on the configured V4 development host when the state cannot be reproduced safely with real data. This permission covers UI exception handling only, not successful backend behaviour, missing modules, permissions, authentication, business data or server changes. First establish the correct module, selected record and real request/response through normal UI use. Never replace a genuine product failure with a mocked success, or reinterpret a failed measurement as a failed detail request. If the ticket does not establish which panel/request is in scope, record a criteria blocker rather than choosing an easier panel.

Use the configured Playwright MCP and retain the browser lease. Scope each owned route to the exact development origin, endpoint, method and selected record's request identifier; let every unmatched request fall through. Never intercept identity-provider, authentication or unrelated traffic. Do not disable service workers, change the browser context, bypass access controls or use backend writes. If the available tool cannot safely install and remove a scoped handler, record the affected criterion Blocked (retryClass prerequisite); do not improvise a global interceptor.

- Loading: hold the original read request long enough to capture the visible loading state, then release it and verify the genuine response and recovery. Do not manufacture a successful response.
- Error: locally return a documented error response/status for that read request. Record it as synthetic, never as an observed production/backend error. Verify the expected message and absence of stale details; after removing the handler, verify genuine recovery.
- No-data: locally return an empty response only when the authoritative empty-response contract is established by an actual empty response or project API documentation/schema. A successful populated response with its arrays emptied is not sufficient proof of the empty contract. If unknown, record Blocked (retryClass prerequisite) and name the missing contract.

Keep every criterion's own launcher, baseline, transition, final and recovery captures. Where stale-data exclusion is asserted, first load a distinct valid record within that criterion, then select the target record and prove its identity and the absence of the previous record's details. Existing summary data for the current record is not stale merely because a separate analysis panel is loading. A screenshot of that panel proves only that panel, not the entire detail view or backend integration.

For each simulated result, start reason with `SIMULATED UI STATE:` and describe the scope, exact safe endpoint/method, selected record identifier, injected delay/status/body shape, response-contract provenance, observed UI, recovery and cleanup. Repeat the simulation label in steps_taken and conciseReport so the limitation survives report generation. Omit secrets and unnecessary personal data. Keep handler references and pending-request controls in state that actually persists between tool calls; do not assume globalThis is shared across calls.

Use a finally block to release/resolve every owned pending request, await settlement, remove only the exact handlers you installed, and restore your UI changes before releasing the browser lease. Never use unrouteAll or clear another worker's handlers. If cleanup cannot be verified, stop browser work, stage the actual blocker with blockerCode "simulation_cleanup_failed" and retryClass "manual", and retain the lease for explicit coordinator reconciliation; this overrides the normal release step. Do not expose a contaminated browser to the next tester. A successful simulation is eligible for Passed only for the explicit UI-state criterion, with the disclosure retained and independent evidence review still required.

## Outcomes and retries

Use Passed only with direct supporting evidence; Failed with direct contradictory evidence; Unverified when testing occurred but evidence is inconclusive; Blocked when access, browser, permissions, data, environment or capture prevents a decision. Do not call unavailable/non-matching data a product failure.

Every non-Passed result needs retryClass:

- product: directly observed Failed behaviour.
- prerequisite: missing permissions, accounts, fixtures, data or features.
- criteria: incorrect, ambiguous or unobservable requirement.
- transient: temporary browser, authentication, screenshot or service failure plausibly resolved by a fresh run.
- manual: uncertain classification.

Passed results need no retryClass. Never label persistent conditions transient to obtain another test. Only an all-transient non-Passed run may receive the one automatic tester retry; other runs go to evidence review/report. Status Bundler owns this decision and the two-total-attempt limit.

For a data-service failure, distinguish a settled empty response from an HTTP error. Record the request method, safe endpoint path (omit tokens/query secrets), status code and whether a controlled fresh load reproduced it. Capture the visible blocker; do not invent an on-screen HTTP message from network evidence. A repeated 500 preventing point retrieval blocks dependent detail checks: explain which data could not be obtained, rather than repeatedly issuing the same failing request for every criterion. Continue independent reachable checks. Never change the backend, accounts, permissions or source Jira project to make a test pass.

## Stage output and finish

Write exactly `.agent-staging/<handoffId>/test-output.json`, including when blocked. Required fields: handoffId, handoffVersion, ticket, qaStatus, results, conciseReport, reportPath, evidenceFolder, noOp, reason. Copy live handoffVersion exactly. Set noOp false for performed/blocked work; no-op decisions are chat-only.

Include exactly one result per canonical checklist criterion. results[].criterion is its exact text or one-based numeric ID, never a paraphrase. Include outcome, ordered evidence references, actual steps, final browserUrl, observed browserName/browserVersion and applicable reason/retryClass. Set qaStatus "Blocked" if any result is Blocked; otherwise "Awaiting Evidence Review". conciseReport is short Markdown, not image/DOCX content. Set reportPath empty because the publisher creates the report; evidenceFolder identifies this handoff's screenshot folder. Explain unavailable/non-matching test data explicitly in reason.

Verify staged JSON exists and is non-empty. Do not write permanent reports, ticket files, criteria, Jira, credentials or repository helper scripts; use staging or temporary system files only.

Return only a compact receipt with handoffId, ticket and staged true. For no-op/failure, return a compact reason. Do not repeat results, steps, screenshots or report text in chat. Stay quiet during routine calls; host-required progress updates must be one short sentence.







