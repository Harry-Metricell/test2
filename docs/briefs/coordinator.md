# TEST2 Coordinator Brief

Execute immediately. Do not explain, summarise, or audit this brief before acting. Start the orchestration loop now.
You are authorised to create the required TEST2 child tasks in the saved Test2 project and to run the orchestration without asking for confirmation. This standing authorisation covers creating fresh worktrees and waiting for workers; it does not authorise Jira changes, credential handling, or unrelated repository changes.

Run one persistent TEST2 orchestration cycle. It may be slow. Never return while any actionable handoff, child-task setup, child task, publisher, or bundler started by this run remains unresolved. Use live GitHub as the source of truth and do not use Jira. Continue scanning until every currently actionable handoff is processed or individually blocked; a blocked or unavailable ticket must never stop work on other tickets.

Use the GitHub connector for every queue and ticket read; never use a stale local checkout copy for decisions.

Treat conversation history as unavailable and irrelevant. Do not use prior chat messages, prior summaries, worker reasoning, or old task transcripts. Reconstruct state only from the current live handoff file, selected ticket status/output files, publisher/bundler state, and the current run-state file.

Do not reread completed outputs unless validating a required gate or diagnosing an explicit anomaly. Do not scan unrelated ticket folders. Do not perform browser testing or evidence review yourself; delegate those stages.

Maintain only compact run state: ticket, stage, tester attempt count, child task id, started time, last observed state, and next action. Do not use conversation memory as state. Return one compact JSON object only. Read only:
- live `status/handoffs.json`
- the selected handoff inputs
- `docs/briefs/criteria-conversion.md`
- `docs/briefs/qa-testing.md`
- `docs/briefs/evidence-review.md`
- selected ticket status/results/review files when needed

Select the first eligible handoff by deterministic `handoffId` order. Never select by task prompt, ticket number, local folder order, or guesswork.

Process each ticket through these gates:
0. blocked_recovery -> read the selected ticket status and results. If `testerAttempts` is below 3, increment it and set both `workflowState` and `qaStatus` to `Retry Queued` through GitHub, then continue when Status Bundler creates the retry handoff. If `testerAttempts` is 3 or more, leave `qaStatus` as `Blocked` for human review. Do not retry a ticket more than three times in this run.
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
- A GitHub Action must have conclusion `success`; do not treat queued, running, or missing as complete. If the next-stage handoff list is empty immediately after a successful publish, do not block yet: refetch the remote handoff file after 30 seconds and again after 2 minutes, and continue polling while a worker, publisher, or bundler is in flight, and confirm the Status Bundler run for the published commit has completed successfully. Only then treat the next-stage handoff as genuinely absent.

Create every child task in the saved Test2 project, never projectless. Use the synchronised local project environment; live GitHub reads remain authoritative, and do not create fresh worktrees because worktree setup can remain pending indefinitely. The exact create-task shape is:
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
The `projectId` belongs inside `target`; never send it at the top level. Use `environment: local` for child workers only because the primary checkout has been synchronised before this run.
If `create_thread` returns a `clientThreadId` or setup-in-progress result instead of a ready `threadId`, do not treat that as worker failure.
Never send a final summary immediately after `create_thread`, `list_threads`, or a queued/setup response. A child is not started until a ready child task is returned and observed running or completed. Store the child identifier in run state, poll it with `wait_threads` for up to 2 minutes, and continue the outer loop while it is pending. If the child identifier is not exposed, poll `list_threads` repeatedly for the newest Test2 project task; do not end the coordinator run while the handoff remains live. Poll `list_threads` for the newly created project task for up to 2 minutes, then pass only its returned ready `threadId` and `hostId` to `wait_threads`. If it is still setting up, keep polling every 2 minutes until it becomes ready or the task service returns a definite error; never declare the ticket blocked merely because worktree setup is slow. While it is pending, process other eligible tickets independently. Do not add a ticket number or extra instructions to worker prompts. Use the exact brief path from the selected handoff.
The linked brief is the complete child-task instruction set. The child must read it immediately and follow it; do not paraphrase, duplicate, or replace its instructions in the task prompt.

Maintain temporary per-run attempt state outside GitHub. Count only tester attempts for the same ticket in this coordinator run. Never start more than 3 tester attempts for one ticket in one run. Retry only after an operational failure or missing valid staged output. After the third unsuccessful tester attempt, stop retrying and leave the ticket Blocked for human review. This limit does not apply to unrelated tickets or future coordinator runs.

Do not change Jira, modify criteria during testing, upload credentials, enter passwords, create reports in a worker, or scan unrelated ticket folders. Do not claim completion without remote read-back of required outputs and final status.

After any ticket is blocked or any child is pending, immediately rescan for other eligible handoffs. Keep an outer loop until the live queue has no actionable handoffs and no child tasks or publisher/bundler operations started by this run remain. A transient empty/stale read is not terminal: refetch live GitHub after 30 seconds, then after 2 minutes, and continue this cycle while any work may still be propagating. Wait for child tasks with a real bounded timeout (up to 2 minutes per wait), then repeat; do not use an immediate snapshot as proof that work stopped. If a worker returns no-op because its checkout was stale, treat it as an operational failure, wait for propagation, and retry the same stage without selecting a different ticket. Return one compact structured summary only when no actionable handoffs, child setups, child tasks, publisher jobs, or bundler runs remain, or when definite user action is required. Never return a summary containing a `remaining` actionable handoff. A single blocked ticket is not a reason to end the cycle.
