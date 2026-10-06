# Metricell V4 QA Automation

Repository-controlled QA workflow for Metricell Smart Network V4. This is a working internal prototype, not a production readiness or security certification. Automated results depend on the supplied ticket, available test data, browser access and independently reviewed evidence.

The system keeps durable QA state in GitHub and uses Codex only for authenticated browser testing, evidence review, criteria ambiguity, and other judgement that static code cannot safely perform.

Start with the [workflow](#flow), [component responsibilities](#component-responsibilities), and [new PC setup](#new-pc-setup). Operational instructions live in [the coordinator brief](docs/briefs/coordinator.md) and [publisher diagnostics](docs/publisher-operations.md).

## Flow

1. The importer reads Jira and saves ticket snapshots under `tickets/<KEY>/ticket.json`; it does not write to Jira. A coordinator requests a fresh import before its first queue decision; the five-minute GitHub schedule remains a safety net, not a guaranteed clock.
2. Status Bundler creates `status/handoffs.json` from the imported tickets and published QA artifacts. A criteria worker checks or rewrites the criteria for each eligible ticket before testing.
   Tickets marked Done or absent from a complete Jira import move to `archive/tickets/<KEY>/` with their history and reports intact. They disappear from active status/site projections and return to `tickets/<KEY>/` if reopened in Jira. A partial Jira response never triggers archiving.
   If the complete Jira source is genuinely too ambiguous to make testable criteria, a Blocked criteria decision records the reason and holds the ticket for manual clarification. It does not consume a tester retry or dispatch the same criteria handoff again until Jira changes.
3. A fresh coordinator chat reads the live GitHub brief and dispatches criteria, tester, evidence-review, and (after a Passed review) user-guide workers in stage order.
4. Workers stage JSON and browser PNGs in the Desktop checkout's ignored `.agent-staging/<handoffId>/` folder. They do not publish permanent ticket files directly.
5. The local publisher validates staged output, copies screenshots and reports to the private evidence folder, and pushes ticket-scoped results from a clean temporary Git worktree.
6. Status Bundler regenerates status, handoffs, and the retry counter. The coordinator resumes from the live queue after publication; the scheduled publisher and Desktop sync do not launch it.

Testing permits at most two total attempts (the first run plus one retry). The tester labels each non-passing criterion with an auditable `retryClass`. Only an all-transient result, or an inconclusive evidence review of an otherwise retryable result, receives the automatic retry. Missing accounts/data, flawed criteria, and observed product failures go straight to evidence review; a final report is required even when testing stops after the first attempt. Older results without a retry classification also go to review rather than being blindly retried. A report still requires valid evidence and successful publisher verification.

The PDF follows the approved template's binary pass/fail convention: Unverified is displayed as Failed with an explanation that evidence was inconclusive; review JSON retains Unverified. See [report evidence](#report-evidence) for capture selection and verification.

## Component responsibilities

| Component | Owns | Does not do |
| --- | --- | --- |
| Jira importer | Read-only Jira snapshots; archive/reopen detection | Change Jira or test the application |
| Status Bundler | Derived tracker state, handoffs and attempt/retry eligibility | Perform browser tests or judge evidence |
| Coordinator | Child dispatch; ignored lock, run state and import requests | Write ticket status, inspect screenshots or build reports |
| Criteria worker | Whole-ticket interpretation and staged checklist decision | Test the application or publish files |
| Tester | One independent browser attempt and its staged results/PNGs | Write permanent reports, assign retries or handle credentials |
| Evidence reviewer | Independent assessment of the selected attempt's local evidence | Change criteria or render documents |
| Guide workers | Passed-only impact decision and concise proposed instructions | Capture new evidence or edit the Word guide |
| Publisher | Validation, private evidence copies, verified documents and ticket-scoped Git commits | Include unrelated Desktop changes in a push |
| Desktop sync | Safe fast-forward of the working checkout | Resolve conflicting human source edits automatically |

Worker chat completion is a receipt, not proof of publication. Dependent stages require the exact remote output and successful bundler propagation. The five active handoff actions and their gates are defined in the coordinator brief; each worker brief is self-contained.

### Report evidence

Reports show decisive criterion states with descriptive captions. Redundant named setup steps and adjacent pixel-identical states are omitted from the printed report, not deleted from private evidence; a changed pixel or a later return to an earlier state is never removed by similarity matching. A small setup appendix retains context.

Where the before/after captures displayed together show a localized change, Word adds clearly labelled detail enlargements beneath those exact full-context images. A crop is never carried over to unrelated setup images. These are display crops of the original embedded PNG, not retouched screenshots; broad changes fall back to complete screenshots. Repeated layer-dialog/loading setup is omitted from settings checks but retained when configuration itself is asserted. Recovered tool errors and cleanup difficulties are reported even when the criterion passed, without changing the reviewed outcome.

The report builder preserves ordered criterion-specific transitions, including unfamiliar capture names, and retains configuration baselines for default checks. It excludes cleanup, removes redundant setup, labels continued image rows and preserves the Metricell format. Environment comes from recorded target hosts; browser identity comes from the running browser, with missing version metadata listed as a limitation.

Image verification proves selected images survived DOCX/PDF conversion, not that they prove the requirement. The independent reviewer must assess the complete attempt. Existing published reports are not rebuilt silently when report code changes.

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

The configured Playwright MCP launcher starts without a network login check, so a site or authentication outage cannot hide its browser tools. Its page hook performs the approved email-and-Continue recovery in the active V4 development browser and saves the refreshed session. Tester chats do not operate sign-in forms. If password, MFA, or consent is needed, use the interactive command below. It opens a private browser; complete sign-in yourself, wait for the launcher, then press Enter. It replaces only the local login file and does not send credentials to GitHub:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\refresh-test2-auth.mjs
```

Restart the Codex desktop app after changing MCP configuration; after a login refresh, start a fresh tester task so it loads the updated state. An existing isolated tester does not inherit a later refresh. A session can still expire during a test; a redirect to sign-in is an environment blocker, not an instruction for the tester to enter credentials.

5. Complete the [reporting dependency](#reporting-dependencies) and [guide-renderer](#user-guide-document-renderer) checks below, then install the two hidden background tasks. Run this in an elevated PowerShell window if task registration is denied:

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

QA report PDF conversion currently requires Microsoft Word at `C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE`, with its COM automation available to the signed-in publisher user. The Python packages alone do not supply a PDF renderer. Confirm Word is installed, activated and has completed first-run setup before enabling publication:

```powershell
Test-Path 'C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE'
```

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

To repair or reinstall background task registration, repeat setup step 5. The publisher installer registers the logon repair task and Startup shortcut. Worker staging and coordinator state stay in the ignored .agent-staging directory; these background tasks do not launch the coordinator.

### Local retention

The publisher removes a handoff's staging folder after successful publication, and archives stale worker output instead of publishing it. Pending or failed handoffs remain for retry. Separately, it prunes only old renderer/debug by-products from `.agent-staging` after 14 days, such as generated draft reports, console logs, and page snapshots. It does not prune the private Playwright login, installed browser/runtime files, or permanent `%USERPROFILE%\Documents\V4-QA-evidence` folder.

For publisher errors, check `%LOCALAPPDATA%\TEST2\publisher.log` and follow [publisher diagnostics](docs/publisher-operations.md). Query Windows tasks outside the sandbox before concluding that registration is missing. A task exit code of zero is not sufficient evidence that a ticket published.

### Playwright screenshots for tester tasks

Tester tasks use Playwright MCP so the browser that performs each action also writes the evidence PNG. The files go directly to the repository-local `.agent-staging\<handoffId>\screenshots`; login state remains local and is never committed.

For MCP installation or configuration changes, follow setup step 4 and restart the app. The page hook handles the approved email-and-Continue redirect; tester chats never operate sign-in controls. External identity-provider or repeated redirects require human sign-in. Missing browser tools use blockerCode browser_tools_unavailable and may receive the one fresh-chat retry; if still missing, verify MCP configuration and restart the app.

A wholly untested attempt where every criterion is Blocked, every evidence list is empty, and each blocker has a reason can receive a final PDF explicitly stating that no browser evidence was captured. This exception cannot pass a ticket or qualify it for guide updates. Passed, Failed, Unverified, and referenced-but-missing evidence retain the normal screenshot verification requirement.

Check the actual MCP connection and its ability to reach the launcher and save a PNG:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\check-test2-playwright-mcp.mjs --browser
```

Without `--browser`, this checks only the handshake and required tool names. Health-check screenshots stay in `.agent-staging/mcp-health`; they are never ticket evidence or committed. The browser check waits for the launcher's GIS module card before taking its screenshot, allowing the approved authentication hook to finish if it interrupted the original navigation.

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

## Coordinator publication recovery

### Import freshness and missing Jira tickets

GitHub scheduled events may be delayed or dropped. The coordinator therefore writes an ignored refresh request with `node scripts/jira-import-refresh.mjs --request --force` at startup. The existing hidden publisher services it once per normal tick, reuses Desktop's existing GitHub authentication without a sign-in window, and dispatches the importer with a unique request identifier. No extra AI worker, Jira credential, scheduled task or self-hosted runner is needed. Before reporting an empty queue, the coordinator requires successful import proof no older than five minutes and reads the queue again from GitHub. A successful no-change import is valid even if `status/handoffs.json` has an older `generatedAt`.

Use `node scripts/jira-import-refresh.mjs --status` in the Desktop checkout to inspect progress. A dispatch acknowledgement, queued run, failed import or timeout never counts as success. Lost dispatch responses are correlated by the unique workflow run name rather than dispatched repeatedly. Failures stay in the ignored request file and the normal publisher log; they do not alter tester retries or stop publication of unrelated outputs. If refresh is blocked, check the referenced importer run and publisher authentication, then request a new refresh after correcting the cause.

For a new machine, keep the existing publisher and Desktop sync tasks running and verify GitHub authentication. Dispatch requires a classic/OAuth token with `repo` access or a fine-grained token with repository **Actions: write** permission; Git push permission alone does not prove this. The task reuses the configured credential helper, or an already configured `GH_TOKEN`/`GITHUB_TOKEN` environment variable; never put tokens in the repository or chat. For another repository, update `config/jira-import-refresh.json` (`repository`, `branch`, `workflow`). Its default freshness limit is five minutes and its timeout is fifteen minutes. The canonical coordinator brief contains the full gate and the credential-free sandbox fallback. The coordinator launch prompt above stays unchanged.

Coordinator recovery checks publication before child-chat availability. If a tester chat cannot be looked up but its exact attempt history is remote and its old handoff has advanced, the coordinator retires that bookkeeping and proceeds to review. `node scripts/reconcile-coordinator-tests.mjs --apply` performs this check from a freshly fetched remote snapshot, backs up the local run-state file, and leaves unresolved tasks and all ticket status fields untouched. A failed task lookup alone must never trigger a duplicate tester.

No active tester entries means no Git subprocess is needed. If the sandbox denies Git spawning, the coordinator uses its GitHub connector to collect commit-pinned queue/history data and successful bundler confirmation, then runs the helper with `--snapshot .agent-staging/coordinator-recovery-snapshot.json --apply`. The snapshot must be complete and less than five minutes old. This fallback does not weaken publication checks or require broader machine permissions; its exact schema and procedure are in the coordinator brief.

## User guide updater

Guide authoring must supply `screenshotCaptions`, one caption per verified screenshot in the same order, describing its actual visible state. The publisher rejects missing or incomplete captions. Historical records without captions remain buildable using neutral screenshot identifiers, never guessed step-to-picture mappings. Report builders always retain the asserted `-final` capture, show decisive images at readable width beneath their criteria, keep criterion-specific filenames even when image bytes are shared, and remove empty back-cover spacer pages.

Report selection prefers recovered captures over same-named superseded captures and treats `-final-recovered` as the end of assertion evidence. Cancel checks show the dialog-before-Cancel and returned map; required initial layer-list baselines are retained. Browser Back checks show the destination-before-Back and returned launcher, rather than redundant earlier launcher setup. All original captures stay in the private attempt folder. These rules do not change page layout or screenshot sizes.

Inconclusive (`Unverified`) evidence is displayed as **Failed** in reports but contributes **zero** to `Defects (No.)`, as do blockers. Only a review's directly contradicted (`Failed`) criteria contribute to that column. The report states this distinction explicitly: these are criterion-level defect counts, not deduplicated Jira bug counts. Reviewers must continue using `Unverified` for evidence gaps rather than claiming an application contradiction.

New guide instructions describe user goals, not mandatory QA cleanup. The authoring brief explains how to turn test evidence into useful instructions; the publisher rejects explicit test bookkeeping, evidence capture, and recorded-initial-state restoration rituals. Legitimate undo and reset-to-default actions remain permitted. Existing published guide sections are not automatically rewritten by this policy change.

The user guide is integrated into the ticket pipeline after a **Passed** evidence review and verified PDF. The guide-impact worker decides `not_needed` or `update_required`. Only `update_required` creates an authoring handoff; that worker selects instructions and screenshots from the ticket's verified evidence. It does not run a separate browser capture. The publisher adds the approved ticket-specific guidance to `assets/user-guide/V4 User Guide.docx`, renders and verifies a temporary PDF, then publishes the Word file and ticket update together. New headings, steps, captions, and screenshot panels are highlighted yellow; unchanged content remains intact. An `amend` update must name the exact prior generated section with `supersedesTicket`; the builder replaces that block and its old screenshots in place. It rejects ambiguous or missing targets instead of appending duplicates. Existing historical duplicates are not automatically removed.

The tracked baseline is `assets/user-guide/V4 User Guide Template.docx`; both it and the living guide contain a hidden `[[AUTO_GUIDE_CONTENT]]` marker. `config/user-guide-plan.json` currently has an empty `sections` list and defines the document paths and yellow-highlight rules. Its optional section plan is not a prerequisite for the ticket-driven guide-impact handoff. Validate guide configuration with:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\check-user-guide-plan.mjs
```

If guide build or verification fails, the staged worker output remains for retry and no partial guide update is pushed. The PDF is a temporary verification artifact, not the published guide. Keep the local LibreOffice renderer described above installed on the publisher PC, or set `TEST2_SOFFICE` to its `soffice.exe` path.

To build a specific already-published guide update locally:

```powershell
& "$env:LOCALAPPDATA\TEST2\node\node.exe" .\scripts\check-user-guide-update-policy.mjs
$reportPython = if ($env:TEST2_PYTHON) { $env:TEST2_PYTHON } else { "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" }
& $reportPython .\scripts\build-user-guide.py --ticket TEST2-123
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

## Boundaries and known limitations

Do not upload credentials or authentication state. Do not change Jira from this repository. Do not change `criteria.md` during testing. Do not claim Passed without direct evidence. Keep the original GitHub report concise and record actual tester `steps_taken`.

Current importer limitation: it requires a complete Jira search response (the workflow requests at most 100 issues). If Jira has more than 100 matching issues, import fails rather than silently importing a partial set. Done or absent tickets are retained under `archive/tickets/`, including their QA history and reports; the active tracker reads only `tickets/`.

- Machine migration requires the local runtimes, saved private browser state, document renderers, GitHub access and hidden tasks. Update the saved project ID in the coordinator brief for the destination Codex project; copying Git files alone does not transfer these capabilities.
- The current implementation contains TEST2 ticket-key and V4 development-host assumptions. Changing the Jira repository variable alone is not a complete migration to another production platform.
- Scheduled tasks use the signed-in Windows user's session. Battery operation is supported, but a powered-off/asleep/logged-out host cannot execute local work. GitHub schedule timing is not guaranteed; the import freshness gate compensates for delayed scheduled imports.
- The coordinator lock uses a 15-minute age threshold, not a distributed lease. Long or overlapping coordinator runs still require care; runtime reconciliation does not prove an unobservable worker has stopped.
- Guide amendments replace exact generated sections. Reorganising the baseline guide and improving editorial integration remain quality work; existing historical duplicates are not automatically removed.
- `docs/briefs/user-guide-capture.md` describes an optional standalone section capture, not an active coordinator/publisher stage. The active guide pipeline reuses passed ticket screenshots.
- Raw screenshots and login state stay local, but published PDFs embed selected screenshots. Repository access therefore governs report data visibility; a public repository does not make embedded test data private. Never publish production-sensitive evidence without an appropriate access review.

## Review and maintenance

Canonical operating rules are in `docs/briefs/`; installers and deterministic scripts are in `scripts/`; configurable policies are in `config/`. Keep launch messages minimal and change the canonical brief rather than layering instructions into coordinator chats.

After changing a brief, check its required output fields and publication gates against the publisher and bundler contracts. CI validates prompt contracts and runs the existing regression suite. Those checks catch accidental contract drift, not every model interpretation or browser failure; a representative end-to-end run remains necessary after material prompt changes.

