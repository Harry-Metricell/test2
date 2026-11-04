# Coordinator publication recovery

If Git spawning fails with EPERM, EACCES or sandbox denial, use connector recovery in the same cycle:

1. Fetch the current default-branch commit SHA. Read its queue and each recorded tester's exact attempt history at that immutable ref; confirm the relevant Status Bundler succeeded.
2. Save `.agent-staging/coordinator-recovery-snapshot.json` with schema "v4-qa-recovery-snapshot.v1", the 40-character commit, current UTC fetchedAt, bundlerSucceeded true, handoffs and histories mapping tester tickets to fetched history objects.
3. Run `node scripts/reconcile-coordinator-tests.mjs --snapshot .agent-staging/coordinator-recovery-snapshot.json --apply`. This mode spawns no Git and rejects incomplete or older-than-five-minute snapshots.

Never fabricate empty queue/history data or bundler success. If Node is also denied, perform the same connector checks, back up run state and update only confirmed records with permitted file tools. Do not request broader machine access just to inspect a completed chat.
