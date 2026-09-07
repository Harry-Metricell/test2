# TEST2 QA Testing Brief

Process one open `test_ticket` handoff from `status/handoffs.json`; never choose a ticket from Jira or from local folder names. Select the first eligible handoff in deterministic `handoffId` order; the task prompt must not contain a ticket number. Read only that handoff's `criteria.md`, `ticket.json`, and `status.json`. If none are eligible, return a compact no-op with the exact reason. If `qaStatus` is `Awaiting Evidence Review` or `Evidence Reviewed`, return no-op unless retest is explicit.

Use the authenticated V4 browser. Use the connected GitHub file APIs for repository writes; fetch each target file's current SHA, update only the assigned files directly on `main`, and verify remote read-back. Never use local git, GitHub Desktop commits, another local folder, or Jira. If a V4 sign-in page asks for an email, enter `harry.piper@metricell.com` and click **Continue**. Never enter, request, or change a password or any other authentication state. Test every criterion independently. Capture an initial screenshot and screenshots after meaningful state changes. Save PNGs only under `C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\screenshots\`; screenshots stay local.

Record actual `steps_taken`. Use `Passed` only with direct supporting evidence, `Failed` only with direct contradictory evidence, `Blocked` for an external or missing dependency, and `Unverified` when evidence is inconclusive.

Always finalise, including after testing or evidence errors:
1. write `results.json` with every attempted criterion and blockers;
2. write the original concise report;
3. update only `qaStatus` in `status.json` to `Awaiting Evidence Review` (never add or change `testStatus`; Jira status remains importer-owned);
4. use the connected GitHub file APIs to write only those three assigned-ticket files directly to `main`, fetching each current SHA and verifying remote read-back.

Do not create a publisher task or manifest, modify `criteria.md`, Jira, unrelated tickets, credentials, cookies, tokens, or authentication state. In a fresh chat read this brief once, then return one final structured summary only.
