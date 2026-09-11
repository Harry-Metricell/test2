# V4-QA-V2

Repository-controlled QA workflow for Metricell Smart Network V4.

The system keeps durable QA state in GitHub and uses Codex only for authenticated browser testing, evidence review, criteria ambiguity, and other judgement that static code cannot safely perform.

## Flow

1. Jira import reads Jira and stores `tickets/<KEY>/ticket.json`; Jira is read-only.
2. Static generation creates canonical criteria, status data, and `status/handoffs.json`.
3. The coordinator reads live GitHub state and creates fresh worker tasks using only the linked brief.
4. Tester and reviewer workers write compact output to local `%LOCALAPPDATA%/TEST2/staging`.
5. The publisher validates output, copies evidence/reports to the configured local evidence folders, and publishes only the relevant ticket files.
6. Status Bundler owns generated status, handoffs, `retries`, and `retryLimit`.

## Publishing safety

The publisher must never push from the dirty Desktop checkout. It uses GitHub Desktop Git and a temporary clean worktree based on the exact live remote `main` SHA. Its private index is populated from that worktree's `HEAD` before staging, so publishing cannot replace the repository with a partial tree.

The publisher requires:

To keep the Desktop checkout current without overwrite prompts, install the safe sync task from this repository in an elevated PowerShell window:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-desktop-sync.ps1 -Repo "$PWD"
```

It runs every two minutes, fetches `origin/main`, and fast-forwards `main` without overwriting local work. Unrelated local files are preserved while syncing; if an incoming commit touches a locally changed file, the task skips and logs that conflict. It also skips a different branch or local-only commits. Review `%LOCALAPPDATA%\TEST2\desktop-sync.log` when a pull appears not to happen. The task does not start or control the coordinator.

- validated JSON output;
- ticket-scoped paths;
- remote read-back after publication;
- local PNG evidence before report generation;
- a verified PDF for a completed evidence report.

The Windows scheduled publisher is kept disabled until a controlled real-output test has passed. The hidden launcher must not be treated as proof of success unless the Node publisher exit code and remote read-back are confirmed.

## Useful commands

```bash
npm run generate
npm run check
```

## Key folders

- `.github/workflows/`: import, validation, and status generation.
- `tickets/`: Jira snapshots and per-ticket QA records.
- `status/`: generated dashboard data and Codex handoffs.
- `docs/briefs/`: complete worker and coordinator instructions.
- `scripts/`: deterministic import, generation, validation, and publishing code.

## Boundaries

Do not upload credentials or authentication state. Do not change Jira from this repository. Do not change `criteria.md` during testing. Do not claim Passed without direct evidence. Keep the original GitHub report concise and record actual tester `steps_taken`.
