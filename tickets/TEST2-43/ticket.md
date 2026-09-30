# TEST2-43: Open Dashboards from the V4 launcher and return

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: QA review complete
- Jira: https://metricell.atlassian.net/browse/TEST2-43

## Acceptance Criteria

1. The launcher shows the Dashboards card and its Open module control.
2. Selecting Open module on the Dashboards card displays the Dashboards module or its current placeholder without an application error.
3. Browser Back returns to the launcher, where the Dashboards card is visible again.

## Subtasks

No subtasks imported.

## Description

Read-only V4 navigation check. Start at https://o2intelligence-v4-dev.metricell.com/launcher in an authenticated browser. Select the Dashboards card's Open module control, then use the browser Back control to return to the launcher. Do not create, edit, or delete any data.
Acceptance criteria:
The launcher shows the Dashboards card and its Open module control.
Selecting Open module on the Dashboards card displays the Dashboards module or its current placeholder without an application error.
Browser Back returns to the launcher, where the Dashboards card is visible again.
