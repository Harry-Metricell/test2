# TEST2 Coordinator Brief

Before reading the queue or creating a child, acquire an exclusive `.agent-staging/coordinator.lock` directory in the synchronised repository checkout. If it exists and is less than 15 minutes old, return a compact no-op and create no child. Replace only stale locks and remove the lock during cleanup. This repository-local lock is writable in child-task sandboxes and prevents separate coordinator chats from processing the same handoff concurrently.

Execute immediately. Do not explain, summarise, or audit this brief before acting.  Start the orchestration loop now. Never delete, archive, pause, rename, or replace this coordinator task or its automation.
Every scheduled or manual run must fetch the live GitHub `docs/briefs/coordinator.md` before reading any other repository file. Never rely on a cached brief, conversation history, or a prior run's interpretation. If the live brief was not fetched first, fetch it before proceeding.
A live entry in `status/handoffs.json` is actionable work, not something awaiting publication. Create the corresponding child immediately when its listed inputs and Jira-status gate are valid. Wait for publisher or Status Bundler propagation only after a child for that exact handoff has been created and has completed or produced staged output. Never describe an untouched live handoff as pending propagation.

You are authorised to create the required TEST2 child tasks in the saved Test2 project and to run the orchestration without asking for confirmation. This standing authorisation covers creating fresh worktrees and waiting for workers; it does not authorise Jira changes, credential handling, or unrelated repository changes.
This standing authorisation also covers automatically continuing testing for every Status-Bundler-generated retry handoff while the ticket's persisted `retries` value is below its `retryLimit` (normally 3). At the retry limit, do not create another tester; if the final test result exists without a verified report, create the final evidence-review worker so a report is produced. Never pause to request approval for any of those retries.

Run one persistent TEST2 orchestration cycle. It may be slow. Never return while any actionable handoff, child-task setup, child task, publisher, or bundler started by this run remains unresolved. Use live GitHub as the source of truth and do not use Jira. Continue scanning until every currently actionable handoff is processed or individually blocked; a blocked or unavailable ticket must never stop work on other tickets.

Use the GitHub connector for every queue and ticket read; never use a stale local checkout copy for decisions.

If a GitHub connector request fails, times out, returns an error, or produces no usable response, resend the same request. Retry immediately once, then retry after 30 seconds, then after 2 minutes. Do not treat a single connector failure as a ticket block or end the coordinator cycle. Notify the user only after the retries produce a definite authentication, permission, or service failure.

The coordinator is read-only for ticket state: never edit, overwrite, or publish `status.json`, `status/tickets.json`, `status/ticket-status.md`, `status/handoffs.json`, `qaStatus`, `workflowState`, `retries`, or `retryLimit`. Status Bundler and the authorised worker/publisher pipeline own all status changes; the coordinator may only observe them and create child tasks.

Treat conversation history as unavailable and irrelevant. Do not use prior chat messages, prior summaries, worker reasoning, or old task transcripts. Reconstruct state only from the current live handoff file, selected ticket status/output files, publisher/bundler state, and the current run-state file.

Do not reread completed outputs unless validating a required gate or diagnosing an explicit anomaly. Do not scan unrelated ticket folders. Do not perform browser testing or evidence review yourself; delegate those stages. Never open, read, inspect, render, repair, generate, or validate any Word or PDF file. A PDF is only a publisher output to wait for after an `evidence_review` child has completed; it is never coordinator input. Treat publisher and bundler state as opaque gates and continue polling the live queue.

Maintain durable compact run state in `.agent-staging/coordinator-run-state.json`: one record per active `handoffId` containing only `handoffId`, `ticket`, `stage`, `childTaskId`, `childHostId`, `startedAt`, `lastObservedState`, and `nextAction`. Reconcile every entry before creating a child. Any entry older than 8 minutes is stale: check the child task and expected output once, then clear it if the child is terminal, missing, or has not produced the expected GitHub output; never let it block unrelated handoffs. If the same handoffId has a live child whose publication/bundler propagation is unresolved, wait for that child and never create a duplicate. Create at most one child for every handoff, including `evidence_review`, in a coordinator cycle. A terminal child with no staged output is a child failure only if that exact handoff is still live after a fresh remote read. If the handoff is gone, do not create a replacement and do not stage a no-op; rescan the queue. Write/update the record immediately after child creation and clear it only after remote output and successful bundler propagation are confirmed. This run-state file is coordinator-owned operational state; all ticket status, retry, criteria, and QA fields remain pipeline-owned. Do not count tester attempts or retries. Do not use conversation memory as state. Return one compact JSON object only. Read only:

Before dispatching any worker, check `.agent-staging/<handoffId>` for its completed output JSON. If present, wait for publication and inspect `publisher-error.json` when present; do not recreate criteria or testing while a valid output is pending publication. A sandboxed Windows task query returning no data is not proof that the publisher task is missing. Use the publisher log or request an outside-sandbox task query. Never recreate worker output to repair a publisher error.
- live `status/handoffs.json`
- the selected handoff inputs
- `docs/briefs/criteria-conversion.md`
- `docs/briefs/qa-testing.md`
- `docs/briefs/evidence-review.md`
- `docs/briefs/user-guide-impact.md`
- `docs/briefs/user-guide-authoring.md`
- selected ticket status/results/review files when needed

Select the first eligible handoff by stage priority, then deterministic `handoffId` order: `criteria_conversion` first, `test_ticket` second, `evidence_review` third, `guide_impact_assessment` fourth, and `guide_update_authoring` fifth. Never select by task prompt, ticket number, local folder order, or guesswork. Do not create a tester or reviewer while any eligible earlier-stage handoff remains.

Process each ticket through these gates:
0. Any pipeline block is handled deterministically by Status Bundler. Do not wait for or create a `blocked_recovery` handoff. If the live queue contains a generated `test_ticket` handoff, create the tester immediately. At `retries` 3, no further test handoff is expected, but an `evidence_review` handoff for the final attempt is required until a remote non-empty `report.pdf` is verified.
1. criteria_conversion -> create a criteria worker.
2. Wait for that worker to finish, then wait for the local publisher to push the criteria output and for GitHub Status Bundler to complete successfully.
3. Refresh live GitHub state. If the selected handoff action is `test_ticket`, the handoff itself is the eligibility gate: create a new tester task immediately when its listed inputs exist, including retry handoffs. Do not open reports, PDFs, screenshots, or prior chat transcripts before creating that tester. Require the selected ticket's imported Jira status to be exactly `READY FOR TESTING` before creating a tester. If Jira is any other status, do not create the tester; wait for the importer and Status Bundler to produce a valid handoff. `Retry Queued` is valid only through its generated `test_ticket` handoff, and it still requires Jira `READY FOR TESTING`.
4. Wait for the tester, then wait for the local publisher and Status Bundler. Confirm the handoff-specific tester history file (`tickets/<KEY>/history/attempt-###-test.json`) is remote, not merely that the reusable `results.json` exists; then confirm the evidence_review handoff exists. A reusable results file from an earlier attempt does not satisfy publication for the current handoff.
5. Only then create the evidence_review worker, and only when the ticket's imported Jira status is exactly `READY FOR TESTING`; if Jira has moved to any other status, wait for the next import/bundler update.
6. Wait for the reviewer, then wait for the local publisher to generate and verify the PDF and push `report.pdf`, `review.json`, `status.json`, and concise `report.md` as one publication. A non-empty PDF alone is insufficient: the publisher must confirm that the referenced browser PNGs were embedded in the generated report before conversion. If report generation or evidence embedding fails, retain the same evidence-review handoff and its staged output; do not publish a partial review, clear the queue, or create a second reviewer. Then wait for Status Bundler and verify all required files and final status by remote read-back.
7. A `guide_impact_assessment` handoff is eligible only after a remote passed evidence review and non-empty report PDF. Create its short assessor, then wait for publisher and bundler propagation of `tickets/<KEY>/guide-impact.json`.
8. A `guide_update_authoring` handoff is eligible only after a remote `update_required` impact decision and the same passed evidence review. Create its short authoring worker, then wait for propagation of `tickets/<KEY>/guide-update.json`. It writes instructions only; it must not capture, render, or edit the Word guide.

Publisher and bundler waits are mandatory:
- A worker finishing is not publication.
- After criteria/test/review output, poll the local staging state until the publisher has consumed the output, then poll live GitHub until the expected files and status are present.
- For a reviewer output, require a non-empty local verified PDF and remote `tickets/<KEY>/report.pdf` before declaring completion.
- Do not start the dependent next stage for the same ticket while its prior output is still only local. Independent criteria-conversion handoffs and independent tickets may continue while another ticket is waiting for publication.
- A GitHub Action must have conclusion `success`; do not treat queued, running, or missing as complete. If the next-stage handoff list is empty immediately after a successful publish, do not block yet: refetch the remote handoff file after 30 seconds and again after 2 minutes, and continue polling while a worker, publisher, or bundler is in flight, and confirm the Status Bundler run for the published commit has completed successfully. Only then treat the next-stage handoff as genuinely absent.

Create every child task in the saved Test2 project, never projectless. Use the synchronised local project environment; live GitHub reads remain authoritative, and do not create fresh worktrees because worktree setup can remain pending indefinitely. The exact create-task shape is:
```json
{
  "target": {
    "type": "project",
    "projectId": "0ff079bf-a407-4d92-ad7c-31d5eb5fde8b",
    "environment": { "type": "local" }
  },
"prompt": "[@GitHub](plugin://github@openai-curated-remote)read and follow: docs/briefs/<selected-brief>.md"
}
```
The `projectId` belongs inside `target`; never send it at the top level. Use `environment: local` for child workers only because the primary checkout has been synchronised before this run.
Every child prompt must be exactly `[@GitHub](plugin://github@openai-curated-remote)read and follow: docs/briefs/<selected-brief>.md for handoff <handoffId> (<ticket>)`; include the exact selected handoff ID and ticket key, and do not add a summary or other instructions. The child must verify that the handoff ID, ticket, action, and `handoffVersion` are still live before acting. If absent or mismatched, return a no-op only in chat and do not write staging output.
If `create_thread` returns a `clientThreadId` or setup-in-progress result instead of a ready `threadId`, do not treat that as worker failure.
Never send a final summary immediately after `create_thread`, `list_threads`, or a queued/setup response. A child is not started until a ready child task is returned and observed running or completed. Store the child identifier in run state, poll it with `wait_threads` for up to 2 minutes, and continue the outer loop while it is pending. If the child identifier is not exposed, poll `list_threads` repeatedly for the newest Test2 project task; do not end the coordinator run while the handoff remains live. Poll `list_threads` for the newly created project task for up to 2 minutes, then pass only its returned ready `threadId` and `hostId` to `wait_threads`. If it is still setting up, keep polling every 2 minutes until it becomes ready or the task service returns a definite error; never declare the ticket blocked merely because worktree setup is slow. While it is pending, process other eligible tickets independently. Do not add a ticket number or extra instructions to worker prompts. Use the exact brief path from the selected handoff.
The linked brief is the complete child-task instruction set. The child must read it immediately and follow it; do not paraphrase, duplicate, or replace its instructions in the task prompt.

The Status Bundler is the sole owner of the persistent `retries` and `retryLimit` fields. Never increment, reset, read as a local counter, or write those fields from the coordinator, and never invent a retry from chat history. Read the live handoff and status files after each bundler run and act only on the handoff that the bundler generated. The coordinator may automatically create and wait for every retry handoff the bundler presents up to the persisted limit; no approval is needed. Do not maintain any separate per-run attempt or retry limit; the bundler's persisted state and live handoff are the only retry gates.

Do not change Jira, modify criteria during testing, upload credentials, enter passwords, create reports in a worker, or scan unrelated ticket folders. Do not claim completion without remote read-back of required outputs and final status.

After any ticket is blocked or any child is pending, immediately rescan for other eligible handoffs. Keep an outer loop until the live queue has no actionable handoffs and no child tasks or publisher/bundler operations started by this run remain. A transient empty/stale read is not terminal: refetch live GitHub after 30 seconds, then after 2 minutes, and continue this cycle while any work may still be propagating. Wait for child tasks with a real bounded timeout (up to 2 minutes per wait), then repeat; do not use an immediate snapshot as proof that work stopped. If a worker returns no-op, first refetch its exact handoff. If it is absent, it is a queue transition: do not retry the child and do not write or publish an output. If the exact handoff remains live, treat it as an operational failure and make one replacement only after the prescribed connector retries. A failed first child must never suppress later tickets. Return one compact structured summary only when no actionable handoffs, child setups, child tasks, publisher jobs, or bundler runs remain, or when definite user action is required. Never return a summary containing a `remaining` actionable handoff. A single blocked ticket is not a reason to end the cycle.




For every `test_ticket` handoff, create one fresh local tester task using the exact selected handoff. Do not use, revive, or message a persistent tester worker. The fresh tester must reread the live QA brief, run its capability preflight, process exactly one handoff, publish its staging output, and then end. Store and poll its ready task ID exactly as for criteria and evidence-review workers. Never create two testers for the same handoff concurrently.

