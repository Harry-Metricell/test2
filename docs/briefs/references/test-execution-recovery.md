# Tester execution recovery

On an execution-host timeout or stale generation, do not keep waiting on the invalid cell ID and do not replay the last click/navigation. Keep the same browser lease, handoff and attempt. Allow one recovery sequence per attempt:

1. In the current tool context, rediscover the installed browser tools, refetch the exact live handoff/version, and confirm `.agent-staging/tester-browser.lock/owner.json` still matches your handoff and retained token. Do not clear or reacquire the lease.
2. If an earlier browser operation is still pending or cannot be shown completed/terminated, stop; a new command could race it. If any interception handler is installed or cleanup is uncertain, stop with simulation_cleanup_failed rather than navigating away or losing the handler identity.
3. Otherwise request one fresh read-only browser_snapshot through the current tool context, not the stale cell. Verify the actual module, layers and record identities against the checkpoint. Foreign activity, a different owner, failed observation or changed live handoff is not permission to continue or overwrite evidence.
4. If ownership is verified, no operation is pending, no handler is installed and the page is observable, restart only the interrupted criterion from the launcher using new allocated filenames. Preserve completed criteria and all earlier captures; do not reset counters, create a worker or stage another attempt. Recheck the criterion's own restored baseline before continuing.

If this recovery cannot be verified, preserve the lease and completed checkpoint, stage truthful transient capability blockers for unfinished criteria and stop for coordinator reconciliation. Never claim that this protocol repairs the external execution host or permits blind replay.
