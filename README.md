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

## Start the coordinator

The complete, canonical coordinator brief is [`docs/briefs/coordinator.md`](docs/briefs/coordinator.md). Keep the rules in that file rather than duplicating them in the README, so the coordinator has one source of truth.

Start each manual or scheduled coordinator cycle as a fresh Codex task in the saved Test2 project with this prompt:

> Fetch the live GitHub `docs/briefs/coordinator.md` before reading any other repository file, then execute that brief immediately. Do not use a cached local copy or previous task history.

The coordinator must continue through all actionable handoffs and required publisher/bundler propagation described by the live brief. The scheduled publisher and Desktop sync tasks do not start or replace the coordinator.

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

The Windows scheduled publisher runs hidden after installation. A successful task launch is not proof of publication: confirm the Node publisher exit code and remote read-back. Worker staging and coordinator runtime state must remain outside the Desktop repository.

## Windows installation

The machine may block the Node.js MSI installer. Use the portable ZIP install instead:

```powershell
$nodeDir="$env:LOCALAPPDATA\TEST2\node"
New-Item -ItemType Directory -Force $nodeDir | Out-Null
Invoke-WebRequest -Uri "https://nodejs.org/dist/v24.19.0/node-v24.19.0-win-x64.zip" -OutFile "$env:TEMP\node.zip"
Expand-Archive "$env:TEMP\node.zip" "$env:TEMP\node-unpack" -Force
Copy-Item "$env:TEMP\node-unpack\node-v24.19.0-win-x64\*" $nodeDir -Recurse -Force
$env:Path="$nodeDir;$env:Path"
node --version
npm.cmd --version
```

Use `npm.cmd` and `npx.cmd` because organisation policy may block the PowerShell wrappers:

```powershell
cd "C:\Users\<user>\Documents\ChatGPT\Test2-github"
npm.cmd install
npx.cmd playwright install chromium
```

Do not commit `.auth/user.json`, API keys, or other credentials.

Install the two hidden Windows tasks from an elevated PowerShell window:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-publisher.ps1 -Repo "$PWD"
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-desktop-sync.ps1 -Repo "$PWD"
```

Desktop sync runs every two minutes and skips safely when conflicting local changes exist. Worker staging and coordinator runtime state use the ignored `.agent-staging` directory. The publisher processes tickets in a fresh checkout of GitHub main, so it works even when Desktop is behind or has local edits. The coordinator itself is started manually as a fresh Codex task; these scheduled tasks do not start it.

For publisher errors, check `%LOCALAPPDATA%\TEST2\publisher.log` and follow [publisher diagnostics](docs/publisher-operations.md). Query Windows tasks outside the sandbox before concluding that registration is missing. A task exit code of zero is not sufficient evidence that a ticket published.

### Playwright screenshots for tester tasks

Tester tasks use Playwright MCP so the browser that performs each action also writes the evidence PNG. The files go directly to the repository-local `.agent-staging\<handoffId>\screenshots`; login state remains local and is never committed.

Configure Codex using a private saved Playwright login. The installer copies it to `%LOCALAPPDATA%\TEST2\auth\user.json`, updates `%USERPROFILE%\.codex\config.toml`, and keeps a backup of the previous configuration:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-playwright-mcp.ps1 -ImportStorageState "C:\private-package\Framework\playwright\.auth\user.json"
```

Restart the Codex desktop app after installation. New tester tasks should expose Playwright browser tools including `browser_navigate`, `browser_snapshot`, and `browser_take_screenshot`. If those tools are absent, do not run a ticket: check the Codex MCP configuration and restart first.

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

