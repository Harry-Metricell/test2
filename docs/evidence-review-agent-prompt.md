# Evidence Review Agent Prompt

Read and follow the action brief: [docs/briefs/evidence-review.md](https://github.com/Harry-Metricell/test2/blob/main/docs/briefs/evidence-review.md).

Review exactly the supplied ticket and no other ticket. Read only the supplied paths and local evidence. Make independent decisions from the canonical criteria and direct evidence. Generate and verify one DOCX, render it once, and update only the assigned `status.json` after successful review.

Do not search the repository, modify Jira, change the original concise report, delete screenshots, or touch unrelated files. Return one final structured JSON summary only.
