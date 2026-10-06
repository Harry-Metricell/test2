# TEST2-55: Open API Request Audit and return to the V4 launcher

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-55

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

An authorised user should be able to open the API Request Audit module and return to the launcher without changing any audit records.
Environment: https://o2intelligence-v4-dev.metricell.com/launcher. Start from the launcher using existing authorised access. Check visible in-session behaviour only; do not edit saved records or change account permissions.
Acceptance Criteria
The launcher displays an API request audit module card with an available open control.
Opening that card displays the API Request Audit dashboard or request explorer with identifiable module content, rather than leaving the user on the launcher, a login screen or an application error page.
Using the browser Back control from the loaded audit module returns to the launcher and displays its module cards again.
Scope: navigation and visible content only. Do not filter sensitive audit records, submit API calls, export data or change settings. Existing access is the only account prerequisite; do not grant permissions or substitute another account.
