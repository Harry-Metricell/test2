# TEST2 Coordinator Brief

Run one bounded TEST2 orchestration cycle. Use live GitHub as the source of truth and do not use Jira. Continue scanning until every currently actionable handoff is processed or individually blocked; a blocked or unavailable ticket must never stop work on other tickets.

Read only:
- `status/handoffs.json`
- the selected handoff inputs
- `docs/briefs/criteria-conversion.md`
- `docs/briefs/qa-testing.md`
- `docs/briefs/evidence-review.md`
- selected ticket status/results/review files when needed

Select the first eligible handoff by deterministic `handoffId` order. Never select by task prompt, ticket number, local folder order, or guesswork.

Process each ticket through these gates:
1. criteria_conversion -> create a criteria worker.
2. Wait for that worker to finish, then wait for the local publisher to push the criteria output and for GitHub Status Bundler to complete successfully.
3. Refresh live GitHub state. Only then create the eligible test_ticket worker.
4. Wait for the tester, then wait for the local publisher and Status Bundler. Confirm the tester output is remote and the evidence_review handoff exists.
5. Only then create the evidence_review worker.
6. Wait for the reviewer, then wait for the local publisher to generate and verify the PDF and push `report.pdf`, `review.json`, `status.json`, and concise `report.md`. Then wait for Status Bundler and verify all required files and final status by remote read-back.

Publisher and bundler waits are mandatory:
- A worker finishing is not publication.
- After criteria/test/review output, poll the local staging state until the publisher has consumed the output, then poll live GitHub until the expected files and status are present.
- For a reviewer output, require a non-empty local verified PDF and remote `tickets/<KEY>/report.pdf` before declaring completion.
- Do not start the next worker while the prior output is still only local.
- A GitHub Action must have conclusion `success`; do not treat queued, running, or missing as complete. If the next-stage handoff list is empty immediately after a successful publish, do not block yet: refetch the remote handoff file up to 3 times with short bounded waits, and confirm the Status Bundler run for the published commit has completed successfully. Only then treat the next-stage handoff as genuinely absent.

Create every child task in the saved Test2 project, never projectless. The exact create-task shape is:
```json
{
  "target": {
    "type": "project",
    "projectId": "39fdf60d-6165-4a78-ad05-c7344f38aacf",
    "environment": { "type": "local" }
  },
  "prompt": "[@GitHub](plugin://github@openai-curated-remote) docs/briefs/<selected-brief>.md"
}
```
The `projectId` belongs inside `target`; never send it at the top level. Do not add a ticket number or extra instructions to worker prompts. Use the exact brief path from the selected handoff.

Maintain temporary per-run attempt state outside GitHub. Count only tester attempts for the same ticket in this coordinator run. Never start more than 3 tester attempts for one ticket in one run. Retry only after an operational failure or missing valid staged output. After the third unsuccessful tester attempt, stop retrying and leave the ticket Blocked for human review. This limit does not apply to unrelated tickets or future coordinator runs.

Do not change Jira, modify criteria during testing, upload credentials, enter passwords, create reports in a worker, or scan unrelated ticket folders. Do not claim completion without remote read-back of required outputs and final status.

After any ticket is blocked, immediately rescan for other eligible handoffs. Return one compact structured summary only when no actionable handoffs or in-flight child tasks remain, or when user action is required. A single blocked ticket is not a reason to end the cycle.
