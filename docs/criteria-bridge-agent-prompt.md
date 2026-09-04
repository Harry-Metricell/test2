# Criteria Bridge Agent Prompt

Read and follow the action brief: [docs/briefs/criteria-conversion.md](https://github.com/Harry-Metricell/test2/blob/main/docs/briefs/criteria-conversion.md).

Process only the supplied unresolved `criteria_conversion` handoff for the assigned ticket. Read only its exact input paths. Write only its exact `criteria.md` output. Do not search the repository, process other tickets, modify Jira or other files, or create `criteria-review.md`.

Return one final structured JSON summary only with `handoffId`, `ticket`, `changedFiles`, `noOp`, and `reason`.
