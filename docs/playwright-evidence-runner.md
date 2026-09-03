# Playwright evidence runner

The workflow `.github/workflows/run-playwright-report.yml` runs the fixed Python Playwright framework on the VPN-connected Windows self-hosted runner.

## One-time runner setup

Create this folder for the runner account:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\MetricellQA"
```

Put the approved Word template here:

```text
%USERPROFILE%\MetricellQA\Test Document Template.docx
```

Keep the saved Playwright login state here:

```text
%USERPROFILE%\MetricellQA\user.json
```

The login state and the template are copied into the checked-out workspace only for the duration of the job. They are ignored and are never committed.

## Run a ticket

Open Actions, choose **Run Playwright QA report**, select **Run workflow**, and enter a key such as `TEST2-3`.

The workflow writes:

```text
tickets/TEST2-3/results.json
tickets/TEST2-3/reports/
tickets/TEST2-3/screenshots/
```

The generated Word report uses the supplied template. A ticket-specific report is produced when the test case metadata contains that Jira key; otherwise the committed report is the complete framework run and must be reviewed before being treated as ticket acceptance.

New features still require a real Playwright test and an explicit Jira-key mapping in `test_cases.json`. The workflow does not invent coverage or outcomes.
