# TEST2 QA Testing Brief

## Select one live handoff

Execute immediately; do not summarise this brief. Fetch live GitHub main `status/handoffs.json`. If a handoff ID and ticket are supplied, verify that exact handoff's ticket, test_ticket action and handoffVersion; do not select another ticket. Otherwise select the first eligible test_ticket by handoffId. If none exists, it changed, or QA status is Awaiting Evidence Review/Evidence Reviewed, return a compact chat-only no-op without staging output.

Read only its remote inputs.criteria, inputs.ticketJson and inputs.status. Retry a failed fetch once after a short wait; never substitute local snapshots, Jira or conversation history. One handoff is one attempt; the publisher assigns permanent attempt numbers.

## Browser and authentication

Use the configured Playwright MCP for all interactions and PNG evidence on the same page. Discover installed browser tools before declaring them unavailable. If absent, mark affected results Blocked with blockerCode "browser_tools_unavailable", retryClass "transient" and the actual tool error. Still stage required JSON; do not invent images or use another browser.

Start the run and every independent criterion with browser_navigate to exactly `https://o2intelligence-v4-dev.metricell.com/launcher`. Wait for the visible launcher and capture that criterion's initial state before interacting. An already-open destination module is not a valid start. If the launcher is unavailable, block rather than test from a destination page.

The MCP launcher uses saved private authentication; its page hook may recover the approved V4 email-and-Continue redirect. Never enter credentials, operate sign-in controls or change authentication state. If sign-in appears, wait briefly and navigate to the launcher once more. If recovered, restart the affected criterion from its initial state; if still unauthenticated or an external identity-provider page appears, report the actual blocker.

Read browser identity once through Playwright browser evaluation. Prefer `navigator.userAgentData.getHighEntropyValues(['fullVersionList'])`, selecting the actual browser brand/version, not placeholder brands; otherwise read `navigator.userAgent`. Record observed browserName and browserVersion per result. Do not open settings, install tools, assume Chrome or claim a full version from a reduced user agent. If unavailable, use null and note the metadata limitation; this alone does not block testing.

## Execute and capture evidence

Test every criterion independently. Identify its required visible states before acting. Record actual steps_taken, observed results and blockers, not intended actions.

For each criterion:

1. Save its own criterion-N-initial.png at the launcher before the first interaction.
2. Save unique criterion-specific PNGs immediately before and after every meaningful state-changing action. Use descriptive names such as criterion-2-before-close.png and criterion-2-after-close.png. Do not capture redundant scrolling, waits or unchanged clicks.
3. Perform required toggle/restore/close/reopen sequences continuously within this criterion. Do not borrow another criterion's images, baseline or a previous run.
4. Save criterion-N-final.png at the decisive assertion, before cleanup, browser Back, return to launcher or the next criterion. A launcher image cannot prove destination controls. If final shows cleanup, recapture the asserted state or mark Unverified, never Passed from notes alone.
5. At that same final state, record the actual current browserUrl. Do not reuse the starting URL or another criterion's URL. Verify any required destination/return URL exactly; a mismatch cannot pass. Page screenshots do not capture browser chrome, so URL claims require this browser-derived value.
6. Restore test-created selections, filters, favourites, maps, panels and data where possible without altering unrelated state. Record incomplete restoration in reason or blockers. Capture cleanup separately, not as final evidence.

Use browser_take_screenshot with type "png", scale "css" and relative filename `<handoffId>/screenshots/<unique-name>.png`. Its working directory is the checkout's ignored .agent-staging, so files belong to `.agent-staging/<handoffId>/screenshots/`. Never use absolute screenshot filenames, tab.screenshot(), OS capture or chat-only images. Never copy evidence into permanent ticket/attempt folders or reuse another handoff's staging folder.

Initial and final PNGs must be separate captures/files even if unchanged. Verify each save exists and is non-empty before continuing. Before staging output, verify all references are readable, inside this handoff's staging folder and owned only by their criterion. Passed, Failed and Unverified require their own initial, transition and final evidence. Missing, unreadable, unverified, out-of-folder or reused evidence makes that criterion Blocked: identify the exact path/error. For Blocked criteria, capture the visible blocker if reachable; otherwise explain why no PNG was possible. Text, screenshot IDs and chat images never replace saved PNGs.

## Outcomes and retries

Use Passed only with direct supporting evidence; Failed with direct contradictory evidence; Unverified when testing occurred but evidence is inconclusive; Blocked when access, browser, permissions, data, environment or capture prevents a decision. Do not call unavailable/non-matching data a product failure.

Every non-Passed result needs retryClass:

- product: directly observed Failed behaviour.
- prerequisite: missing permissions, accounts, fixtures, data or features.
- criteria: incorrect, ambiguous or unobservable requirement.
- transient: temporary browser, authentication, screenshot or service failure plausibly resolved by a fresh run.
- manual: uncertain classification.

Passed results need no retryClass. Never label persistent conditions transient to obtain another test. Only an all-transient non-Passed run may receive the one automatic tester retry; other runs go to evidence review/report. Status Bundler owns this decision and the two-total-attempt limit.

## Stage output and finish

Write exactly `.agent-staging/<handoffId>/test-output.json`, including when blocked. Required fields: handoffId, handoffVersion, ticket, qaStatus, results, conciseReport, reportPath, evidenceFolder, noOp, reason. Copy live handoffVersion exactly. Set noOp false for performed/blocked work; no-op decisions are chat-only.

Include exactly one result per canonical checklist criterion. results[].criterion is its exact text or one-based numeric ID, never a paraphrase. Include outcome, ordered evidence references, actual steps, final browserUrl, observed browserName/browserVersion and applicable reason/retryClass. Set qaStatus "Blocked" if any result is Blocked; otherwise "Awaiting Evidence Review". conciseReport is short Markdown, not image/DOCX content. Set reportPath empty because the publisher creates the report; evidenceFolder identifies this handoff's screenshot folder. Explain unavailable/non-matching test data explicitly in reason.

Verify staged JSON exists and is non-empty. Do not write permanent reports, ticket files, criteria, Jira, credentials or repository helper scripts; use staging or temporary system files only.

Return only a compact receipt with handoffId, ticket and staged true. For no-op/failure, return a compact reason. Do not repeat results, steps, screenshots or report text in chat. Stay quiet during routine calls; host-required progress updates must be one short sentence.







