# TEST2 Coordinator Brief

Run one bounded TEST2 orchestration cycle. Use GitHub as the source of truth and do not use Jira.

Read only:
- `status/handoffs.json`
- the selected handoff inputs
- the three worker briefs: `docs/briefs/criteria-conversion.md`, `docs/briefs/qa-testing.md`, `docs/briefs/evidence-review.md`
- the selected ticket's status/results/review files when needed

Discover eligible work from the live GitHub handoff list and select the first eligible handoff by deterministic `handoffId` order. Never select by task prompt, ticket number, local folder order, or guesswork.

Process each ticket through the gated sequence:
1. criteria-conversion handoff -> create a new project-backed child task with only `[@GitHub](plugin://github@openai-curated-remote)` and `docs/briefs/criteria-conversion.md`
2. after remote criteria/status refresh, test_ticket handoff -> create a new project-backed child task with only the GitHub mention and `docs/briefs/qa-testing.md`
3. after tester output is published and evidence handoff exists, evidence_review handoff -> create a new project-backed child task with only the GitHub mention and `docs/briefs/evidence-review.md`
4. after reviewer output, wait for the local publisher and GitHub status-bundler; confirm report.pdf, review.json, status.json, and the final status by remote read-back

Create child tasks in the saved Test2 project, never projectless:
- projectId: `39fdf60d-6165-4a78-ad05-c7344f38aacf`
- target: project with local environment
- do not include a ticket number or extra instructions in worker prompts

Wait for each child task to finish before starting the next gated stage. After every stage, refresh the remote handoff/status state; a stale local checkout is not evidence of missing work. If the required child task cannot be created, record the exact task-service error and stop that ticket without substituting work.

Maintain temporary per-run attempt state outside GitHub. Count only tester attempts for the same ticket in this coordinator run. Never start more than 3 tester attempts for one ticket in one run. Retry only when the prior attempt failed operationally or produced no valid staged output. If the third attempt still cannot complete, stop retrying and leave the ticket Blocked for human review. Do not apply the three-attempt rule to unrelated tickets or future coordinator runs.

Do not test Jira, change criteria during testing, upload credentials, enter passwords, create reports yourself, or scan unrelated ticket folders. Do not claim a ticket complete without remote read-back of the required outputs and final status.

Remain quiet while state is unchanged. Return one compact structured summary only when the cycle completes, is blocked, or needs user action.
