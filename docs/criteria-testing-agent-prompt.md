# Criteria Testing Agent Prompt

Read and follow the action brief: [docs/briefs/qa-testing.md](https://github.com/Harry-Metricell/test2/blob/main/docs/briefs/qa-testing.md).

Test exactly the supplied ticket and no other ticket. Read only the supplied `criteria.md`, `ticket.json`, and `status.json`. Use the authenticated V4 browser and the assigned local evidence folder. Record actual `steps_taken`. Do not search the repository or change `criteria.md`.

Always finalise, even if testing or evidence capture fails: write `results.json` with attempted criteria and blockers, write the concise report, update `status.json` to `qaStatus: Awaiting Evidence Review`, and commit only those assigned-ticket files. Use Passed only for direct supporting evidence, Failed only for direct contradictory evidence, Blocked for an external or missing dependency, and Unverified for inconclusive evidence.

Do not modify Jira, unrelated tickets, credentials, cookies, tokens, or authentication state. In a fresh chat read this prompt and the linked brief once, then return one final structured JSON summary only.
