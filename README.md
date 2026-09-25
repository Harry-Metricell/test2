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

## New PC setup

Complete these steps in order before starting the coordinator. GitHub contains the code, the report template, and the package lock; your saved V4 login remains private and must be supplied separately.

1. Open PowerShell and enter the repository folder:

```powershell
cd "C:\Users\<user>\Documents\ChatGPT\Test2-github"
```

2. Install portable Node locally. This avoids organisation policies that can block the MSI installer:

The machine may block the Node.js MSI installer. Use the portable ZIP install instead:

```powershell
$nodeDir="$env:LOCALAPPDATA\TEST2\node"
New-Item -ItemType Directory -Force $nodeDir | Out-Null
Invoke-WebRequest -Uri "https://nodejs.org/dist/v24.19.0/node-v24.19.0-win-x64.zip" -OutFile "$env:TEMP\node.zip"
Expand-Archive "$env:TEMP\node.zip" "$env:TEMP\node-unpack" -Force
Copy-Item "$env:TEMP\node-unpack\node-v24.19.0-win-x64\*" $nodeDir -Recurse -Force
$env:Path="$nodeDir;$env:Path"
node --version
& "$nodeDir\npm.cmd" --version
```

3. Install the repository packages and Chromium with the portable runtime. Use these explicit paths even if `npm` and `npx` are not on PATH:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\npm.cmd" install
& "$env:LOCALAPPDATA\TEST2\node\npx.cmd" playwright install chromium
```

4. Install the saved V4 browser login and Playwright MCP. You must provide the private `user.json` source path; it is deliberately not stored in GitHub:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-playwright-mcp.ps1 -ImportStorageState "C:\private-package\Framework\playwright\.auth\user.json"
```

Restart the Codex desktop app after this step. A tester task must then show the Playwright browser tools, including `browser_navigate`, `browser_snapshot`, and `browser_take_screenshot`.

If a tester reaches a sign-in page, do not rely on logging in through an ordinary browser: isolated tester tasks cannot use that browser session. Refresh the private tester login instead. The command opens a browser; complete the usual sign-in yourself, wait until the V4 launcher is visible, then return to PowerShell and press Enter. It replaces only the local private login file and does not send credentials to GitHub:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\refresh-test2-auth.mjs
```

Restart the Codex desktop app after a successful refresh, then create a fresh tester task. This avoids the tester needing to submit an email/password or MFA form itself.

5. Install the two hidden background tasks. Run this in an elevated PowerShell window if task registration is denied:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-publisher.ps1 -Repo "$PWD"
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-desktop-sync.ps1 -Repo "$PWD"
```

6. Confirm the setup before running the coordinator:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" --version
& "$env:LOCALAPPDATA\TEST2\node\npx.cmd" playwright --version
Get-ScheduledTask -TaskName "TEST2 Agent Publisher","TEST2 Desktop GitHub Sync" | Select-Object TaskName,State
Test-Path "$env:LOCALAPPDATA\TEST2\auth\user.json"
```

The Desktop sync task fast-forwards only `main` when it is not ahead of GitHub. If incoming changes overlap generated Jira/status projections (`status/generated/*.json`, `status/handoffs.json`, `status/ticket-status.md`, `status/tickets.json`, and imported ticket `status.json`/`ticket.md`), it saves byte-for-byte copies under the ignored `.agent-staging/desktop-sync-backup/` folder and refreshes those projections from GitHub. Hand-edited source files and local commits are never overwritten; an overlap there is logged and requires manual reconciliation. The sync log is `%LOCALAPPDATA%\TEST2\desktop-sync.log`.

The report template is safely stored in Git at `assets/templates/Automated Test Case Template.docx`; the publisher uses it by default. Do not commit `.auth/user.json`, API keys, or other credentials.

### Reporting dependencies

The publisher uses the pinned packages in `requirements-reporting.txt` to build evidence reports and verify their screenshots. The bundled Codex runtime already includes them. On another machine, install them into the Python selected by `TEST2_PYTHON` before enabling the publisher:

```powershell
python -m pip install -r .\requirements-reporting.txt
```

### User-guide document renderer

Word guide updates are rendered to images for a visual check before they are published. Install the local-only LibreOffice renderer once; it is extracted under `%LOCALAPPDATA%\TEST2\libreoffice` and does not alter the shared Windows installation:

```powershell
$downloadDir = "$env:TEMP\TEST2-document-renderer"
$msi = "$downloadDir\LibreOffice_26.8.0_Win_x86-64.msi"
New-Item -ItemType Directory -Force $downloadDir | Out-Null
if (-not (Test-Path -LiteralPath $msi)) {
  Invoke-WebRequest -Uri "https://download.documentfoundation.org/libreoffice/stable/26.8.0/win/x86_64/LibreOffice_26.8.0_Win_x86-64.msi" -OutFile $msi
}
New-Item -ItemType Directory -Force "$env:LOCALAPPDATA\TEST2\libreoffice" | Out-Null
Start-Process msiexec.exe -ArgumentList @('/a', $msi, '/qn', "TARGETDIR=$env:LOCALAPPDATA\TEST2\libreoffice") -Wait
& "$env:LOCALAPPDATA\TEST2\libreoffice\program\soffice.exe" --version
```

The temporary guide baseline already has a hidden `[[AUTO_GUIDE_CONTENT]]` insertion marker. It remains visually unchanged, but the future updater can replace that exact paragraph with yellow-highlighted approved changes.

The same two hidden Windows tasks can be repaired or reinstalled at any time:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-publisher.ps1 -Repo "$PWD"
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-desktop-sync.ps1 -Repo "$PWD"
```

Desktop sync runs every two minutes and skips safely when conflicting local changes exist. Worker staging and coordinator runtime state use the ignored `.agent-staging` directory. The publisher processes tickets in a fresh checkout of GitHub main, so it works even when Desktop is behind or has local edits. The coordinator itself is started manually as a fresh Codex task; these scheduled tasks do not start it.

### Local retention

The publisher automatically removes renderer/debug by-products from `.agent-staging` after 14 days, including generated draft reports, renderer page images, console logs, and page snapshots. It never automatically deletes worker output JSON, screenshot folders, `publisher-error.json`, the private Playwright login, installed browser/runtime files, or the permanent `%USERPROFILE%\Documents\V4-QA-evidence` folder. Those protected files are either required to retry a failed handoff or are the local copy of test evidence.

For publisher errors, check `%LOCALAPPDATA%\TEST2\publisher.log` and follow [publisher diagnostics](docs/publisher-operations.md). Query Windows tasks outside the sandbox before concluding that registration is missing. A task exit code of zero is not sufficient evidence that a ticket published.

### Playwright screenshots for tester tasks

Tester tasks use Playwright MCP so the browser that performs each action also writes the evidence PNG. The files go directly to the repository-local `.agent-staging\<handoffId>\screenshots`; login state remains local and is never committed.

Configure Codex using a private saved Playwright login. The installer copies it to `%LOCALAPPDATA%\TEST2\auth\user.json`, updates `%USERPROFILE%\.codex\config.toml`, and keeps a backup of the previous configuration:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-playwright-mcp.ps1 -ImportStorageState "C:\private-package\Framework\playwright\.auth\user.json"
```

Restart the Codex desktop app after installation. New tester tasks should expose Playwright browser tools including `browser_navigate`, `browser_snapshot`, and `browser_take_screenshot`. If those tools are absent, do not run a ticket: check the Codex MCP configuration and restart first.

When the saved V4 session expires, refresh it through the dedicated private browser flow rather than an ordinary browser window:

The TEST2 owner has approved entering `harry.piper@metricell.com` and selecting `Continue` on the V4 development sign-in page. If that step completes sign-in without further interaction, refresh the saved tester login automatically:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\refresh-test2-auth.mjs --email-continue
```

If the site instead needs a password, MFA, or other human action, use the existing interactive flow below. The automatic command keeps the old saved login if it cannot reach the launcher.

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\refresh-test2-auth.mjs
```

Complete sign-in in the opened browser, press Enter only after the V4 launcher is visible, and restart Codex. The script refuses to overwrite the saved state if the browser is still on an authentication page.

## Useful commands

```bash
npm run generate
npm run check
npm run check:guide
```

## User guide updater

The user guide is a separate document-update workflow, not a Jira or coordinator action. It preserves the current Word guide and applies guide updates from **Passed** tickets only. Every new heading, step, caption, and screenshot panel is highlighted yellow; unchanged content remains unmodified.

While creating the initial Word template, save it as `assets/user-guide/V4 User Guide Template.docx`. Use normal Word heading styles and place `[[AUTO_GUIDE_CONTENT]]` on its own paragraph where feature sections should be inserted. Do not highlight the initial template: yellow is reserved for changes made after its first approval.

Add one object to `config/user-guide-plan.json` for each feature section, with an id, title, HTTPS starting URL, ordered steps, and required screenshot ids. Validate the plan before capture:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\check-user-guide-plan.mjs
```

The publisher now builds the Word guide as part of publishing each approved `guide-update-output.json`. It embeds that ticket's verified PNGs, renders the guide to PDF, checks that the approved text and **each actual screenshot** survived conversion, and commits the Word guide alongside the ticket update. If a build or verification fails, neither is pushed; the staged worker output remains available for retry. The PDF is a temporary verification artifact, not the published guide. Keep the local LibreOffice renderer described above installed on the publisher PC, or set `TEST2_SOFFICE` to its `soffice.exe` path.

To build a specific already-published guide update locally:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\check-user-guide-update-policy.mjs
& "$env:LOCALAPPDATA\TEST2\python\python.exe" .\scripts\build-user-guide.py --ticket TEST2-123
```

The builder rejects missing PNGs, preserves unchanged content, places each new screenshot in a yellow panel, and retains the hidden `[[AUTO_GUIDE_CONTENT]]` marker for the next update. It is idempotent: building the same ticket twice does not add a duplicate section. Existing published updates, such as TEST2-32, must be applied once manually if they were published before this automatic step was installed.

### Ticket-driven guide decisions

Only tickets with a completed, **Passed** evidence review can be assessed for user-guide impact. Failed, blocked, unreviewed, and report-less tickets never enter this stage. The short assessor records either `not_needed` or `update_required`. For `update_required`, a compact authoring worker reuses only the ticket’s verified PNG evidence and writes a proposed section title, ordered user steps, and the source screenshots to `tickets/<KEY>/guide-update.json`. The deterministic Word builder then applies these approved inputs to the living guide, keeping the insertion marker for the next update.

This behaviour is deliberately easy to change without code: edit `config/user-guide-impact-policy.json`, then validate it before starting the coordinator:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\check-user-guide-impact-policy.mjs
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\check-user-guide-update-policy.mjs
```

Do not set `onlyForPassedEvidenceReviews` to `false`: validation rejects it so the guide remains based on verified delivered behaviour.

## Key folders

- `.github/workflows/`: import, validation, and status generation.
- `tickets/`: Jira snapshots and per-ticket QA records.
- `status/`: generated dashboard data and Codex handoffs.
- `docs/briefs/`: complete worker and coordinator instructions.
- `scripts/`: deterministic import, generation, validation, and publishing code.

## Boundaries

Do not upload credentials or authentication state. Do not change Jira from this repository. Do not change `criteria.md` during testing. Do not claim Passed without direct evidence. Keep the original GitHub report concise and record actual tester `steps_taken`.

