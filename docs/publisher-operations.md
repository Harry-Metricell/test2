# Publisher operation and diagnosis

The Windows task `TEST2 Agent Publisher` invokes a hidden launcher every minute.
Each invocation reads `.agent-staging/<handoffId>`, fetches GitHub, and processes
ticket inputs in a temporary checkout of remote main. The Desktop checkout can
be behind or contain local edits; publishing must not modify those edits.

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

All worker output and Playwright PNGs share `.agent-staging`. A test publication
checks referenced PNGs and their permanent copies before publishing test status.
Changing MCP configuration requires restarting the app to reload the browser server.

Regression check (local disposable Git remote; no GitHub writes):
`node --test scripts/publisher-regression.test.mjs`
