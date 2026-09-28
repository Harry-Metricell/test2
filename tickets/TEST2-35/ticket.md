# TEST2-35: Verify Dashboards placeholder and in-app return to launcher

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: QA review complete
- Jira: https://metricell.atlassian.net/browse/TEST2-35

## Acceptance Criteria

1. The launcher displays a Dashboards module card with an enabled control to open Dashboards.
2. Selecting the Dashboards card opens https://o2intelligence-v4-dev.metricell.com/dashboards and displays the "Under construction" message and a visible "Back to Launcher" button, without an application error.
3. Selecting "Back to Launcher" returns to https://o2intelligence-v4-dev.metricell.com/launcher, where the Dashboards card is visible again.
4. This checks navigation and the current placeholder only. It does not require dashboard creation or data.

## Subtasks

No subtasks imported.

## Description

Small V4 regression test for the Dashboards module's visible placeholder and its in-app return control.
Start at https://o2intelligence-v4-dev.metricell.com/launcher. Sign in if prompted.
Acceptance criteria:
The launcher displays a Dashboards module card with an enabled control to open Dashboards.
Selecting the Dashboards card opens https://o2intelligence-v4-dev.metricell.com/dashboards and displays the "Under construction" message and a visible "Back to Launcher" button, without an application error.
Selecting "Back to Launcher" returns to https://o2intelligence-v4-dev.metricell.com/launcher, where the Dashboards card is visible again.
This checks navigation and the current placeholder only. It does not require dashboard creation or data.
