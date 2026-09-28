# TEST2-37: Reload the V4 Dashboards placeholder and return to launcher

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-37

## Acceptance Criteria

1. Opening Dashboards from the launcher displays the Dashboards page at https://o2intelligence-v4-dev.metricell.com/dashboards with its Under construction message and Back to Launcher button.
2. Reloading that page leaves the Dashboards placeholder usable: the Under construction message and Back to Launcher button remain visible without an application error.
3. Selecting Back to Launcher returns to https://o2intelligence-v4-dev.metricell.com/launcher, where the Dashboards card is visible.
4. Capture browser evidence of the page after reload and after returning.

## Subtasks

No subtasks imported.

## Description

Small V4 navigation and reload regression test. Start at https://o2intelligence-v4-dev.metricell.com/launcher and sign in if prompted. Open the Dashboards card. This checks only the current placeholder; creating dashboards or data is out of scope.
Acceptance criteria:
Opening Dashboards from the launcher displays the Dashboards page at https://o2intelligence-v4-dev.metricell.com/dashboards with its Under construction message and Back to Launcher button.
Reloading that page leaves the Dashboards placeholder usable: the Under construction message and Back to Launcher button remain visible without an application error.
Selecting Back to Launcher returns to https://o2intelligence-v4-dev.metricell.com/launcher, where the Dashboards card is visible.
Capture browser evidence of the page after reload and after returning.
