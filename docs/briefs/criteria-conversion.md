# TEST2 Criteria Conversion Brief

## Select one live handoff

Execute immediately; do not summarise this brief. Fetch live GitHub main `status/handoffs.json`. Verify the supplied handoff ID, ticket, criteria_conversion action and handoffVersion; do not substitute another ticket. Without a supplied ID, select the first eligible criteria_conversion by handoffId. An absent/changed handoff requires a compact chat-only no-op, with no staging folder/output.

Read only its remote inputs.ticketJson, status/generated/<KEY>.json and tickets/<KEY>/criteria.md when present. Retry failed fetches once after a short wait; never use stale local inputs, direct Jira or conversation history.

## Check the complete ticket

Read the original summary, full description, acceptance criteria, change details, scope, exclusions and relevant notes. Existing criteria.md is input to assess, not proof of quality.

Each criterion must faithfully express one clear action/state, observable expected result and necessary starting condition, without hidden assumptions. Remove duplicates, split combined actions, recover omitted requirements and replace vague/uncheckable wording with screenshot-testable criteria. Write the improved checklist even if the existing one is poor.

Informal, shorthand, incomplete or absent acceptance-criteria formatting alone is not a blocker. If summary/description identifies recoverable product behaviour, produce the smallest faithful checklist. Block only when the full source supplies no recoverable behaviour or necessary outcome/scope/starting state cannot genuinely be inferred; state exactly what clarification is missing. Do not invent requirements or proxies for unobservable requirements. Explain unobservable scope in reason; block only if no faithful testable criteria remain.

Keep tester safety, setup advice, exclusions and QA/documentation instructions outside the checklist. For example, "do not create or modify audit data" constrains testing; it is not a demand to prove invisible backend side effects. Guide/report-update requests are owned by downstream stages unless the application itself has a testable documentation feature. Preserve relevant constraints in reason; do not turn headings or pipeline instructions into criteria.

Format criteriaMarkdown as one unchecked bullet per criterion, beginning exactly `- [ ] `. An optional Acceptance Criteria heading is allowed. Never use numbered lists, checked boxes, tables or prose-only criteria.

## Stage output and finish

Write `.agent-staging/<handoffId>/criteria-output.json` with handoffId, handoffVersion, ticket, criteriaMarkdown, qaStatus, noOp and reason. Copy live handoffVersion exactly. Set noOp false for a decision.

Set qaStatus "Ready for Testing" only with valid criteria. Otherwise set "Blocked", criteriaMarkdown empty and reason explaining missing information. A criteria block holds for manual clarification until Jira changes; it consumes no tester attempt.

Verify output exists and is non-empty. Do not modify permanent ticket files, Jira, screenshots, reports, credentials or authentication state. This is a criteria-quality check: do not read test evidence/results/PDFs.

Return only a compact receipt with handoffId, ticket and staged true; for no-op/failure, a compact reason. Never repeat the checklist or narrate routine calls; host-required updates must be one short sentence.
