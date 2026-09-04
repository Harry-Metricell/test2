# TEST2 QA Testing Brief

Test exactly the supplied TEST2 ticket and no other ticket.

Read only the supplied `criteria.md`, `ticket.json`, and `status.json`. If `qaStatus` is `Awaiting Evidence Review` or `Evidence Reviewed`, return no-op unless retest is explicit.

Use the authenticated V4 browser. Test every criterion independently. Capture an initial screenshot and screenshots after meaningful state changes. Save PNGs only under `C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\screenshots\`.

Record actual `steps_taken`. Use `Passed` only with direct supporting evidence, `Failed` only with direct contradictory evidence, `Blocked` when testing cannot proceed because of an external or missing dependency, and `Unverified` when testing occurred but evidence is inconclusive.

Direct-push authorization: for this TEST2 QA workflow, the user authorizes pushing the tester's assigned evidence, concise report, results.json, and status.json directly to the repository's main branch. Do not ask for confirmation for that scoped push. Never push unrelated files, credentials, authentication state, or changes to criteria.md.

Always finalise, including after testing or evidence errors:
1. write `results.json` with every attempted criterion and blockers;
2. write the original concise report;
3. update `status.json` to `qaStatus: Awaiting Evidence Review`;
4. commit only those assigned-ticket files.

Do not modify `criteria.md`, Jira, unrelated tickets, credentials, cookies, tokens, or authentication state. In a fresh chat read this brief once, then return one final JSON summary only.
