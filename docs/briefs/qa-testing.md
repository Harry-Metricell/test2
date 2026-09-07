# TEST2 QA Testing Brief

Process exactly one uniquely assigned open `test_ticket` handoff from `status/handoffs.json`; never choose a ticket from Jira or from local folder names. Read only that handoff's `criteria.md`, `ticket.json`, and `status.json`. If zero or multiple eligible handoffs exist, return a compact no-op or blocker with the exact reason. Never select the first, oldest, newest, or an arbitrary ticket. If `qaStatus` is `Awaiting Evidence Review` or `Evidence Reviewed`, return no-op unless retest is explicit.

Use the authenticated V4 browser. If a V4 sign-in page asks for an email, enter `harry.piper@metricell.com` and click **Continue**. Never enter, request, or change a password or any other authentication state. Test every criterion independently. Capture an initial screenshot and screenshots after meaningful state changes. Save PNGs only under `C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\screenshots\`; screenshots stay local.

Record actual `steps_taken`. Use `Passed` only with direct supporting evidence, `Failed` only with direct contradictory evidence, `Blocked` for an external or missing dependency, and `Unverified` when evidence is inconclusive.

Always finalise, including after testing or evidence errors:
1. write `results.json` with every attempted criterion and blockers;
2. write the original concise report;
3. update only `qaStatus` in `status.json` to `Awaiting Evidence Review` (never add or change `testStatus`; Jira status remains importer-owned);
4. use the connected GitHub app's file APIs to write only those three assigned-ticket files directly to `main`.

Do not use local `git push`, create a publisher task or manifest, modify `criteria.md`, Jira, unrelated tickets, credentials, cookies, tokens, or authentication state. If the GitHub app is unavailable, make no repository write and report the blocker. In a fresh chat read this brief once, then return one final structured summary only.
