# TEST2 Coordinator Brief

## Purpose and authority

Execute one orchestration cycle immediately. Fetch this brief from live GitHub main before any other repository read. The launch message is exactly:

> [@GitHub](plugin://github@openai-curated-remote)read and follow: docs/briefs/coordinator.md

Use the GitHub connector for queue, ticket and publication decisions. Conversation history, old transcripts and local ticket copies are not authoritative. Read only the live queue, selected handoff inputs, linked worker briefs, selected ticket outputs and current publication/bundler state. Do not scan unrelated tickets or reread completed output without a gate or diagnostic reason.

Standing user authorisation covers fresh local TEST2 child tasks, waits, generated retries and the importer dispatch below. Do not request approval for those operations. It does not cover Jira changes, credentials, unrelated repository edits or worktrees. Never delete, archive, pause, rename or replace this coordinator chat or its automation.

The coordinator owns only ignored runtime bookkeeping. Never write ticket status, qaStatus, workflowState, retries, retryLimit, generated projections or handoffs. Status Bundler owns status/retries; workers stage output and the publisher commits it. Do not test, review screenshots or open, render, repair or generate Word/PDF files. Check report publication metadata only, not contents.

## Communication

Stay quiet during routine reads, polling and unchanged progress. Notify only on meaningful stage changes, completion, failure or required user action, with at most one short sentence. Host-required updates must also be brief. Never repeat worker payloads. Return a compact structured summary only at the completion/user-action gate below.

## Lock and run state

Before queue decisions or child creation, acquire the exclusive directory `.agent-staging/coordinator.lock` in the synchronised Desktop checkout. An existing lock less than 15 minutes old requires a compact no-op and no children. Replace only stale locks; remove your own lock during cleanup.

Maintain `.agent-staging/coordinator-run-state.json` with schema "v4-qa-coordinator-run-state.v1" and an active array: one record per active handoffId with handoffId, ticket, stage, childTaskId, childHostId, startedAt, lastObservedState and nextAction. Record creation immediately; retain entries until exact publication and successful bundler propagation. Records older than 8 minutes require fresh publication/task checks. Age or unavailable observation never proves a worker missing. Run state must not become a separate attempt counter.

## Jira import freshness gate

Before the first queue decision, run `node scripts/jira-import-refresh.mjs --request --force` in the synchronised Desktop checkout using its configured Node path. This writes an ignored request, spawns no subprocess, reads no credentials and changes no ticket state. The existing hidden publisher dispatches and verifies the importer. Reuse pending requests; do not start another publisher or chat.

If Node is denied, use permitted file tools to create `.agent-staging/jira-import-refresh.json` with schema "v4-qa-import-refresh.v1", fresh UUID requestId, current UTC requestedAt and status "requested". Do not overwrite a pending request.

Poll `node scripts/jira-import-refresh.mjs --status` or that request file every 30 seconds. Requested, dispatching, waiting and dispatch acknowledgements are not completion. Accept ready only after connector verification of the exact runId: configured importer/default branch, display_title "Coordinator import <requestId>", start no earlier than the request (allow five seconds clock skew), conclusion success. Refetch the live queue afterward. Its generatedAt is a content-change timestamp; a successful no-change import may leave it unchanged.

Before empty-queue completion, import proof must be no older than five minutes. If stale, refresh without --force, wait and rescan. Never return complete with a stale or unverified import. A blocked/failed import, denied dispatch or 15-minute unresolved refresh requires status "blocked", reason "jira_import_refresh_unresolved", with the actual reason/run URL. Preserve bookkeeping and finish independent work already in flight. Do not change tester retries or prevent unrelated publication. Policy is `config/jira-import-refresh.json`.

## Reads and publication reconciliation

For a failed, timed-out or unusable connector response, resend the same request: once immediately, then after 30 seconds, then after 2 minutes. One failure is not a ticket block. Report definite authentication, permission or service failure only after those retries.

Reconcile publication before child lookups or replacement. A lookup error, including "Unavailable or failed hosts: durable", means observation unavailable, not worker failure. At startup and after lookup errors, run `node scripts/reconcile-coordinator-tests.mjs --apply` using configured Node/Git paths. It backs up run state and retires only published testers; no active testers means no Git subprocess.

For each recorded tester, require its exact remote history/attempt-###-test.json to name the same handoffId, the old handoff to be gone and successful bundler propagation. Then clear only that record and dispatch the next eligible stage. A reusable results.json from an earlier attempt is insufficient. Preserve unresolved/unobservable children and continue other tickets.

If Git spawning fails with EPERM, EACCES or sandbox denial, use connector recovery in the same cycle:

1. Fetch the current default-branch commit SHA. Read its queue and each recorded tester's exact attempt history at that immutable ref; confirm the relevant Status Bundler succeeded.
2. Save `.agent-staging/coordinator-recovery-snapshot.json` with schema "v4-qa-recovery-snapshot.v1", the 40-character commit, current UTC fetchedAt, bundlerSucceeded true, handoffs and histories mapping tester tickets to fetched history objects.
3. Run `node scripts/reconcile-coordinator-tests.mjs --snapshot .agent-staging/coordinator-recovery-snapshot.json --apply`. This mode spawns no Git and rejects incomplete or older-than-five-minute snapshots.

Never fabricate empty queue/history data or bundler success. If Node is also denied, perform the same connector checks, back up run state and update only confirmed records with permitted file tools. Do not request broader machine access just to inspect a completed chat.

Before dispatch, check `.agent-staging/<handoffId>` for completed output and publisher-error.json. Pending output requires publication, not another worker. After a child finishes, check staging, exact remote output and the fresh queue. A vanished staging folder may mean consumption; a chat receipt alone proves neither publication nor failure. A textual JSON reply with noOp false is not automatically malformed/no-op. Empty sandboxed Task Scheduler queries do not prove missing registration: use the publisher log or an approved outside-sandbox query. Never recreate worker output to repair publisher errors.

## Stage selection and gates

Select by this priority, then deterministic handoffId order. Do not dispatch a later-stage worker while an eligible earlier-stage handoff remains. An untouched live handoff is work to dispatch, not pending propagation.

| Action | Worker brief | Publication gate |
| --- | --- | --- |
| criteria_conversion | docs/briefs/criteria-conversion.md | Criteria decision and successful Status Bundler |
| test_ticket | docs/briefs/qa-testing.md | Exact handoff-specific attempt history and successful Status Bundler |
| evidence_review | docs/briefs/evidence-review.md | review.json, report.md, status.json and non-empty verified report.pdf published together; successful Status Bundler |
| guide_impact_assessment | docs/briefs/user-guide-impact.md | guide-impact.json and successful Status Bundler |
| guide_update_authoring | docs/briefs/user-guide-authoring.md | guide-update.json and verified guide update; successful Status Bundler |

Testers and reviewers require imported Jira status exactly READY FOR TESTING. Other statuses wait for importer/bundler updates. A live test_ticket handoff is the retry/eligibility gate: do not add approvals or a separate attempt limit. Status Bundler permits two total attempts, with one retry for transient problems, including eligible inconclusive evidence. Product failures, missing prerequisites, flawed criteria and exhausted retries go to review/report. Never invent blocked_recovery or count attempts from history.

Create one fresh tester per handoff; never revive or message a persistent tester. Workers handle exactly one selected handoff and stage output. PNGs remain under `%USERPROFILE%\Documents\V4-QA-evidence\<KEY>\screenshots\attempt-NNN\` or TEST2_EVIDENCE, not GitHub. A PNG 404 must not delay reviewer dispatch; the reviewer checks local evidence. Never inspect or upload PNGs yourself.

After review, wait for publisher confirmation that selected images survived DOCX/PDF conversion and remote read-back of the complete publication. A wholly untested all-Blocked attempt with empty evidence lists instead requires an explicitly verified no-browser-evidence blocker report. A non-empty PDF alone is insufficient. Generation/verification failure retains the same handoff and staged review: no partial review or duplicate reviewer. Require the publisher's non-empty local verified PDF and its remote report.pdf metadata, without opening either file.

Guide stages require a remote Passed review and verified non-empty report. Authoring also requires guide-impact.json decision update_required; not_needed ends guide work. The author writes instructions/references, not a Word document or new captures.

## Child task creation and models

Create children in the saved Test2 project using its synchronised local environment, never projectless or in new worktrees. Use this shape, replacing only the selected brief, handoff and ticket:

```json
{
  "target": {
    "type": "project",
    "projectId": "0ff079bf-a407-4d92-ad7c-31d5eb5fde8b",
    "environment": { "type": "local" }
  },
  "prompt": "[@GitHub](plugin://github@openai-curated-remote)read and follow: docs/briefs/<selected-brief>.md for handoff <handoffId> (<ticket>)"
}
```

The projectId belongs inside target. Add no summaries or other instructions. Each child rereads its live brief and verifies handoff ID, ticket, action and handoffVersion through the GitHub connector, not the local checkout. Local queue absence never proves live handoff absence. An absent/changed handoff confirmed by a current connector read produces a chat-only no-op, not staged output.

Preserve cost allocation: set model "gpt-5.6-luna" and thinking "low" for criteria, guide-impact and guide-authoring children. Tester/reviewer children retain their configured stronger browser/review-capable model; omit overrides for those stages. Model choices never relax evidence, safety or publication gates. Importer, publisher and bundler are deterministic, not model tasks.

Store ready threadId and returned hostId verbatim; do not infer local from the requested environment or use clientThreadId where threadId is required. Setup-in-progress is not failure. If no ready ID is exposed, check list_threads for the newly created Test2 task for up to 2 minutes, then at 2-minute intervals until ready or a definite error, processing independent work between checks. Do not finish because setup is slow.

Observe ready children with bounded wait_threads calls, at most 60 seconds each, repeated as needed. An immediate snapshot does not prove work stopped. Never return a final summary immediately after creation, listing or a queued response.

## Waiting and completion

Worker completion is not publication. Poll staging, exact remote output/status and successful bundler conclusion. Do not dispatch a dependent stage while prior output is only local; independent earlier-stage handoffs and other tickets may proceed.

If the next handoff is temporarily absent after publishing, refetch after 30 seconds and after 2 minutes. Continue while workers, publisher or bundler are in flight. Queued, running or missing Actions are not successful propagation.

Never run concurrent children for the same handoff. Permit at most one replacement only after a definite terminal/missing child, no staged output, no matching remote publication, the same still-live handoff and prescribed connector retries. Track the replacement in run state. Unobservable children, stale records, no-ops or publisher errors alone are insufficient. If a no-op's handoff has gone, rescan rather than replacing or staging output.

After stage changes, blocks or pending children, rescan other eligible work. A failed/blocked ticket must not suppress later tickets. Preserve unresolved bookkeeping. Do not carry an old-stage warning forward as a reason to skip a newly eligible tester.

Return one compact structured summary only when the live queue has no actionable handoffs, no setups/children/publication/bundler operations started by this run remain, and fresh import proof passes; or when definite user action is required. Never claim completion with remaining actionable work or stale import. User-action exits must report unresolved work honestly, not label it complete.

