# TEST2 QA Testing Brief

Task: test exactly the supplied TEST2 ticket and no other ticket.

Read only the supplied criteria.md, ticket.json, and status.json. If qaStatus is Awaiting Evidence Review or Evidence Reviewed, return no-op unless retest is explicit.

Test every criterion independently in the authenticated V4 browser. Capture an initial screenshot and screenshots after meaningful state changes. Save evidence only under the assigned local V4-QA-evidence ticket folder.

Record actual steps_taken. Use Passed only with direct supporting evidence, Failed only with direct contradictory evidence, Blocked when testing cannot proceed because of an external or missing dependency, and Unverified when testing occurred but evidence is inconclusive.

Always finalise the assigned ticket, even after a testing or evidence error:
1. write results.json with every attempted criterion and blockers;
2. write the concise report;
3. update status.json to qaStatus Awaiting Evidence Review;
4. commit only those assigned-ticket files.

Do not modify criteria.md, Jira, unrelated tickets, credentials, cookies, tokens, or authentication state. Return one final JSON summary only.
