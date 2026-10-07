# Publisher operation and diagnosis

## Execution and ownership

The Windows task `TEST2 Agent Publisher` invokes a hidden launcher every minute.
The publisher, its logon repair task, and Desktop sync are installed to run on battery power. Windows Task Scheduler defaults to blocking battery starts unless the installers explicitly allow them. If publication stops while unplugged, inspect `DisallowStartIfOnBatteries`, `StopIfGoingOnBatteries`, and `NumberOfMissedRuns`; rerun the installers to restore these settings.
Each invocation reads `.agent-staging/<handoffId>`, fetches GitHub, and processes
ticket inputs in a temporary checkout of remote main. The Desktop checkout can
be behind or contain local edits; publishing must not modify those edits.

## Diagnose stalled publication

Logs: `%LOCALAPPDATA%\TEST2\publisher.log` (JSON lines, with one rotated backup).
`published` identifies the ticket/handoff after remote commit verification.
`failed` records the actual exception. Task exit code zero alone is not proof
that a ticket was published: it may mean there was no pending output.

Inspect Task Scheduler from a normal Windows user session, or an approved
outside-sandbox terminal. Empty results from sandboxed task queries do not
prove that a task has disappeared. Do not suppress diagnostic errors.

```powershell
Get-ScheduledTaskInfo -TaskName 'TEST2 Agent Publisher' -ErrorAction Stop
Get-Content "$env:LOCALAPPDATA\TEST2\publisher.log" -Tail 20
```

Only reinstall if registration is actually missing. The Startup shortcut and
logon repair task reinstall registration; they do not fix publisher code errors.
For a failed publication, fix the logged cause and retain the staged output for
the next scheduled run. Do not rerun the criteria worker just because publication
is pending. Require remote `criteriaVerified: true` and a new handoff before testing.

## Recovery decision table

| Symptom | Check | Safe next action |
| --- | --- | --- |
| Child completed, queue unchanged | Staged output, `publisher-error.json`, publisher log, exact remote handoff/attempt history | Repair the logged publisher cause; reuse the output, not another child |
| Remote output exists, handoff unchanged | Status Bundler run and the fresh default-branch queue | Repair/rerun bundling; never manually advance ticket status |
| Desktop behind remote | `desktop-sync.log`, local source edits and commits | Fast-forward a clean checkout; preserve overlapping source edits for reconciliation |
| Tester sees authentication | Saved private browser state and MCP browser health check | Refresh the private login; start a fresh tester only if the live queue permits it |
| Coordinator reports a lock | Lock age plus observable active run state | A fresh lock means wait; use the brief's stale-lock/reconciliation procedure, not blanket deletion |
| PDF identity verification fails | Named unmatched evidence and selected manifest | Repair conversion/selection; retain staged review and never bypass verification |

Completion has three separate proofs: the exact output was read back from GitHub,
Status Bundler succeeded, and the live handoff advanced. A worker receipt,
successful Git command, empty staging directory or zero task exit code alone is
not enough. Local original screenshots are retained even when the PDF omits
redundant setup images. Do not clear retries or delete pending evidence to make
the dashboard look complete.

All worker output and Playwright PNGs share `.agent-staging`. A test publication
checks referenced PNGs and their permanent copies before publishing test status.
Changing MCP configuration requires restarting the app to reload the browser server.

## Regression check

Local disposable Git remote; no GitHub writes. Set `TEST2_GIT` to an available Git executable first:
`node --test scripts/publisher-regression.test.mjs`
