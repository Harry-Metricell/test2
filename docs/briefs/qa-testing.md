# TEST2 QA Testing Brief

Test exactly the supplied TEST2 ticket and no other ticket.

Read only the supplied `criteria.md`, `ticket.json`, and `status.json`. If `qaStatus` is `Awaiting Evidence Review` or `Evidence Reviewed`, return no-op unless retest is explicit.

Use the authenticated V4 browser. Test every criterion independently. Capture an initial screenshot and screenshots after meaningful state changes. Save PNGs only under `C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\screenshots\`.

Record actual `steps_taken`. Use `Passed` only with direct supporting evidence, `Failed` only with direct contradictory evidence, `Blocked` for an external or missing dependency, and `Unverified` when evidence is inconclusive.

Always finalise, including after testing or evidence errors:
1. write `results.json` with every attempted criterion and blockers;
2. write the original concise report;
3. update `status.json` to `qaStatus: Awaiting Evidence Review`;
4. write a local `publish-manifest.json` listing only the assigned ticket's `results.json`, concise report, and `status.json`; keep screenshot paths local in the results.

Do not run `git push`, request push confirmation, modify `criteria.md`, Jira, unrelated tickets, credentials, cookies, tokens, or authentication state. A separate publisher handles the allowlisted GitHub update. In a fresh chat read this brief once, then return one final structured summary only.
