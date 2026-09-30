# V4-QA-V2

Repository-controlled QA workflow for Metricell Smart Network V4.

The system keeps durable QA state in GitHub and uses Codex only for authenticated browser testing, evidence review, criteria ambiguity, and other judgement that static code cannot safely perform.

## Flow

1. The scheduled importer reads Jira and saves ticket snapshots under `tickets/<KEY>/ticket.json`; it does not write to Jira.
2. Status Bundler creates `status/handoffs.json` from the imported tickets and published QA artifacts. A criteria worker checks or rewrites the criteria for each eligible ticket before testing.
   Tickets marked Done or absent from a complete Jira import move to `archive/tickets/<KEY>/` with their history and reports intact. They disappear from active status/site projections and return to `tickets/<KEY>/` if reopened in Jira. A partial Jira response never triggers archiving.
   If the complete Jira source is genuinely too ambiguous to make testable criteria, a Blocked criteria decision records the reason and holds the ticket for manual clarification. It does not consume a tester retry or dispatch the same criteria handoff again until Jira changes.
3. A fresh coordinator chat reads the live GitHub brief and dispatches criteria, tester, evidence-review, and (after a Passed review) user-guide workers in stage order.
4. Workers stage JSON and browser PNGs in the Desktop checkout's ignored `.agent-staging/<handoffId>/` folder. They do not publish permanent ticket files directly.
5. The local publisher validates staged output, copies screenshots and reports to the private evidence folder, and pushes ticket-scoped results from a clean temporary Git worktree.
6. Status Bundler regenerates status, handoffs, and the retry counter. The coordinator resumes from the live queue after publication; the scheduled publisher and Desktop sync do not launch it.

Testing permits at most two total attempts (the first run plus one retry). The tester labels each non-passing criterion with an auditable `retryClass`. Only an all-transient result, or an inconclusive evidence review of an otherwise retryable result, receives the automatic retry. Missing accounts/data, flawed criteria, and observed product failures go straight to evidence review; a final report is required even when testing stops after the first attempt. Older results without a retry classification also go to review rather than being blindly retried. A report still requires valid evidence and successful publisher verification.

## Start the coordinator

The complete, canonical coordinator brief is [`docs/briefs/coordinator.md`](docs/briefs/coordinator.md). Keep the rules in that file rather than duplicating them in the README, so the coordinator has one source of truth.

Start each manual coordinator cycle as a fresh Codex task in the saved Test2 project with exactly this prompt:

> [@GitHub](plugin://github@openai-curated-remote)read and follow: docs/briefs/coordinator.md

Do not add instructions to that launch message. The brief requires a fresh live read and contains the worker-selection, lock, retry, and publication rules. A completed chat is not itself proof that output was published; check the live handoff queue and ticket files.

## Publishing safety

The publisher must never push from the dirty Desktop checkout. It uses GitHub Desktop Git and a temporary clean worktree based on the exact live remote `main` SHA. Its private index is populated from that worktree's `HEAD` before staging, so publishing cannot replace the repository with a partial tree.

The publisher validates worker JSON and handoff identity, checks ticket-scoped paths and local PNG evidence, verifies rendered PDF evidence, and reads back its GitHub commit. Its temporary Git worktree keeps unrelated Desktop edits out of the push. A task exit code of zero may mean there was nothing to publish; check `%LOCALAPPDATA%\TEST2\publisher.log` for a `published` event and the resulting ticket files on GitHub.

Desktop sync runs every two minutes. It fast-forwards `main` when safe, preserves unrelated local files, backs up overlapping generated projections, and skips conflicting source edits or local-only commits. Read `%LOCALAPPDATA%\TEST2\desktop-sync.log` if it does not update. Both background tasks and the publisher repair task are configured to start and continue on battery power.

## New PC setup

Complete these steps in order before starting the coordinator. First sign in to GitHub Desktop and clone this repository on the `main` branch into `C:\Users\<user>\Documents\ChatGPT\Test2-github`. The scheduled publisher relies on a Git installation with unattended GitHub push access; a successful Desktop sign-in alone should be verified with a normal push before relying on the publisher. GitHub contains the code, document templates, and package lock; your saved V4 login remains private and must be supplied separately.

For a new GitHub repository, configure Actions secrets `JIRA_URL`, `JIRA_EMAIL`, and `JIRA_API_TOKEN`, and set the `JIRA_PROJECT_KEY` repository variable (or accept the TEST2 fallback). Keep the Import and Status Bundler workflows enabled. They use repository write permission; the local publisher also needs push access to `main`. No Jira credentials belong in this checkout.

1. Open PowerShell and enter the repository folder:

```powershell
cd "C:\Users\<user>\Documents\ChatGPT\Test2-github"
```

2. Install portable Node locally if it is not already present. This avoids organisation policies that can block the MSI installer:

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
& "$env:LOCALAPPDATA\TEST2\node\npm.cmd" ci
& "$env:LOCALAPPDATA\TEST2\node\npx.cmd" playwright install chromium
```

4. Install the saved V4 browser login and Playwright MCP. You must provide the private `user.json` source path; it is deliberately not stored in GitHub:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-playwright-mcp.ps1 -ImportStorageState "C:\path\to\private\user.json"
```

Restart the Codex desktop app after this step. A tester task must then show the Playwright browser tools, including `browser_navigate`, `browser_snapshot`, and `browser_take_screenshot`.

The configured Playwright MCP launcher checks the saved login before each isolated tester starts and can perform the approved email-and-Continue step on the V4 development site. Tester chats do not operate sign-in forms. If the automatic refresh cannot reach the launcher because password, MFA, or consent is needed, use the interactive command below. It opens a private browser; complete sign-in yourself, wait for the launcher, then press Enter. It replaces only the local login file and does not send credentials to GitHub:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\refresh-test2-auth.mjs
```

Restart the Codex desktop app after changing MCP configuration; after a login refresh, start a fresh tester task so it loads the updated state. An existing isolated tester does not inherit a later refresh. A session can still expire during a test; a redirect to sign-in is an environment blocker, not an instruction for the tester to enter credentials.

5. Install the two hidden background tasks. Run this in an elevated PowerShell window if task registration is denied:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-publisher.ps1 -Repo "$PWD"
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-desktop-sync.ps1 -Repo "$PWD"
```

6. Confirm the setup before running the coordinator:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" --version
& "$env:LOCALAPPDATA\TEST2\node\npx.cmd" playwright --version
Get-ScheduledTask -TaskName "TEST2 Agent Publisher","TEST2 Agent Publisher Repair","TEST2 Desktop GitHub Sync" | Select-Object TaskName,State,@{N='RunsOnBattery';E={-not $_.Settings.DisallowStartIfOnBatteries -and -not $_.Settings.StopIfGoingOnBatteries}}
Test-Path "$env:LOCALAPPDATA\TEST2\auth\user.json"
```

The Desktop sync task fast-forwards only `main` when it is not ahead of GitHub. If incoming changes overlap generated Jira/status projections (`status/generated/*.json`, `status/handoffs.json`, `status/ticket-status.md`, `status/tickets.json`, and imported ticket `status.json`/`ticket.md`), it saves byte-for-byte copies under the ignored `.agent-staging/desktop-sync-backup/` folder and refreshes those projections from GitHub. Hand-edited source files and local commits are never overwritten; an overlap there is logged and requires manual reconciliation. The sync log is `%LOCALAPPDATA%\TEST2\desktop-sync.log`.

The report template is safely stored in Git at `assets/templates/Automated Test Case Template.docx`; the publisher uses it by default. Do not commit `.auth/user.json`, API keys, or other credentials.

The evidence folder defaults to the current Windows user's `%USERPROFILE%\Documents\V4-QA-evidence`, not a named person's profile. Set `TEST2_EVIDENCE` on the publisher and reviewer host if evidence belongs elsewhere. The publisher likewise finds bundled Git and Python under the current user's profile; set `TEST2_GIT` or `TEST2_PYTHON` when using other installations. Reviewer tasks must use the same evidence root as the publisher.

### Reporting dependencies

The publisher uses the pinned packages in `requirements-reporting.txt` to build evidence reports and verify their screenshots. It defaults to Codex's bundled Python; verify that interpreter has the packages on the target PC. If it does not, install them into the Python selected by `TEST2_PYTHON` (or into the bundled interpreter) before enabling the publisher:

```powershell
$reportPython = if ($env:TEST2_PYTHON) { $env:TEST2_PYTHON } else { "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" }
& $reportPython -c "import docx, PIL, pypdf"
```

Only if that import check fails, install the pinned requirements into the selected interpreter:

```powershell
& $reportPython -m pip install -r .\requirements-reporting.txt
```

### User-guide document renderer

Word guide updates are rendered to a temporary PDF and checked for the approved text and screenshots before publication. Install the local-only LibreOffice renderer once; it is extracted under `%LOCALAPPDATA%\TEST2\libreoffice` and does not alter the shared Windows installation:

```powershell
$downloadDir = "$env:TEMP\TEST2-document-renderer"
$msi = "$downloadDir\LibreOffice_26.8.0_Win_x86-64.msi"
New-Item -ItemType Directory -Force $downloadDir | Out-Null
if (-not (Test-Path -LiteralPath $msi)) {
  Invoke-WebRequest -Uri "https://download.documentfoundation.org/libreoffice/stable/26.8.0/win/x86_64/LibreOffice_26.8.0_Win_x86-64.msi" -OutFile $msi
}
New-Item -ItemType Directory -Force "$env:LOCALAPPDATA\TEST2\libreoffice" | Out-Null
Start-Process msiexec.exe -ArgumentList @('/a', $msi, '/qn', "TARGETDIR=$env:LOCALAPPDATA\TEST2\libreoffice") -WindowStyle Hidden -Wait
& "$env:LOCALAPPDATA\TEST2\libreoffice\program\soffice.exe" --version
```

The tracked guide template and living guide already contain the hidden `[[AUTO_GUIDE_CONTENT]]` marker. Approved ticket updates are inserted before that marker with yellow highlighting; the updater is active, not a future manual step.

The two hidden Windows tasks can be repaired or reinstalled at any time. The publisher installer also registers its logon repair task and Startup shortcut:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-publisher.ps1 -Repo "$PWD"
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-desktop-sync.ps1 -Repo "$PWD"
```

Desktop sync runs every two minutes and skips safely when conflicting local changes exist. Worker staging and coordinator runtime state use the ignored `.agent-staging` directory inside the Desktop checkout. The publisher processes tickets in a fresh checkout of GitHub main, so it works even when Desktop is behind or has local edits. The coordinator itself is started manually as a fresh Codex task; these scheduled tasks do not start it.

### Local retention

The publisher removes a handoff's staging folder after successful publication, and archives stale worker output instead of publishing it. Pending or failed handoffs remain for retry. Separately, it prunes only old renderer/debug by-products from `.agent-staging` after 14 days, such as generated draft reports, console logs, and page snapshots. It does not prune the private Playwright login, installed browser/runtime files, or permanent `%USERPROFILE%\Documents\V4-QA-evidence` folder.

For publisher errors, check `%LOCALAPPDATA%\TEST2\publisher.log` and follow [publisher diagnostics](docs/publisher-operations.md). Query Windows tasks outside the sandbox before concluding that registration is missing. A task exit code of zero is not sufficient evidence that a ticket published.

### Playwright screenshots for tester tasks

Tester tasks use Playwright MCP so the browser that performs each action also writes the evidence PNG. The files go directly to the repository-local `.agent-staging\<handoffId>\screenshots`; login state remains local and is never committed.

Configure Codex using a private saved Playwright login. The installer copies it to `%LOCALAPPDATA%\TEST2\auth\user.json`, updates `%USERPROFILE%\.codex\config.toml`, and keeps a backup of the previous configuration:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-test2-playwright-mcp.ps1 -ImportStorageState "C:\path\to\private\user.json"
```

Restart the Codex desktop app after installation. New tester tasks should expose Playwright browser tools including `browser_navigate`, `browser_snapshot`, and `browser_take_screenshot`. The TEST2 Playwright launcher refreshes the private login before each new isolated browser server starts. A page hook also handles an approved V4 email-and-Continue redirect in the active tester browser and saves the refreshed session. Testers wait briefly and retry the launcher once; they never operate sign-in controls. External identity-provider or repeated redirects still require human sign-in. If startup refresh fails, the server stops with a clear error. If the tools are absent, check the Codex MCP configuration and restart first.

When the saved V4 session expires, refresh it through the dedicated private browser flow rather than an ordinary browser window:

The local preflight is limited to the V4 development host and the approved email-and-Continue action. To check or refresh it manually without opening a visible browser:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\refresh-test2-auth.mjs --email-continue
```

If the site instead needs a password, MFA, or other human action, use the existing interactive flow below. The automatic command keeps the old saved login if it cannot reach the launcher.

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\refresh-test2-auth.mjs
```

Complete sign-in in the opened browser, press Enter only after the V4 launcher is visible, and restart Codex. The script refuses to overwrite the saved state if the browser is still on an authentication page.

## Useful commands

Run these from the repository root. `generate` rewrites derived status files; use it only when intentionally rebuilding them, not as a Desktop sync command.

```powershell
& "$env:LOCALAPPDATA\TEST2\node\npm.cmd" run check
& "$env:LOCALAPPDATA\TEST2\node\npm.cmd" run check:guide
& "$env:LOCALAPPDATA\TEST2\node\npm.cmd" run check:guide-impact
& "$env:LOCALAPPDATA\TEST2\node\npm.cmd" run check:guide-update
& "$env:LOCALAPPDATA\TEST2\node\npm.cmd" run generate
```

GitHub Actions runs the Node publisher/status/criteria/Jira regression tests and Python report/guide tests on relevant code changes. For local publisher regression tests, set `TEST2_GIT` to a Git executable first; the tests use a disposable local remote, not the live GitHub repository.

## User guide updater

The user guide is integrated into the ticket pipeline after a **Passed** evidence review and verified PDF. The guide-impact worker decides `not_needed` or `update_required`. Only `update_required` creates an authoring handoff; that worker selects instructions and screenshots from the ticket's verified evidence. It does not run a separate browser capture. The publisher adds the approved ticket-specific guidance to `assets/user-guide/V4 User Guide.docx`, renders and verifies a temporary PDF, then publishes the Word file and ticket update together. New headings, steps, captions, and screenshot panels are highlighted yellow; unchanged content remains intact. An `amend` update must name the exact prior generated section with `supersedesTicket`; the builder replaces that block and its old screenshots in place. It rejects ambiguous or missing targets instead of appending duplicates. Existing historical duplicates are not automatically removed.

The tracked baseline is `assets/user-guide/V4 User Guide Template.docx`; both it and the living guide contain a hidden `[[AUTO_GUIDE_CONTENT]]` marker. `config/user-guide-plan.json` currently has an empty `sections` list and defines the document paths and yellow-highlight rules. Its optional section plan is not a prerequisite for the ticket-driven guide-impact handoff. Validate guide configuration with:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\check-user-guide-plan.mjs
```

If guide build or verification fails, the staged worker output remains for retry and no partial guide update is pushed. The PDF is a temporary verification artifact, not the published guide. Keep the local LibreOffice renderer described above installed on the publisher PC, or set `TEST2_SOFFICE` to its `soffice.exe` path.

To build a specific already-published guide update locally:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\check-user-guide-update-policy.mjs
& "$env:LOCALAPPDATA\TEST2\python\python.exe" .\scripts\build-user-guide.py --ticket TEST2-123
```

The builder rejects missing PNGs, preserves unchanged content, places each new screenshot in a yellow panel, and retains the hidden marker for the next update. It is idempotent: building the same ticket twice does not add a duplicate section. `status/guide-updates.json` is the compact index of currently active generated sections, including those sourced from archived tickets; the authoring worker uses it to select an amendment target. The local command above writes the tracked living guide; review the resulting Git diff before committing a manual rebuild.

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

Current importer limitation: it requires a complete Jira search response (the workflow requests at most 100 issues). If Jira has more than 100 matching issues, import fails rather than silently importing a partial set. Done or absent tickets are retained under `archive/tickets/`, including their QA history and reports; the active tracker reads only `tickets/`.

