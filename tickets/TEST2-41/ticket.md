# TEST2-41: Navigate from API Request Audit to the Dashboards placeholder

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create testing handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-41

## Acceptance Criteria

1. API Request Audit opens from the launcher and shows its dashboard or request explorer without an application error.
2. Browser Back returns to the launcher with the Dashboards card visible.
3. Opening Dashboards shows the current placeholder with its Under construction message and Back to Launcher control, without an application error.
4. Capture browser evidence and the observed URL at each decisive state.

## Subtasks

No subtasks imported.

## Description

V4 read-only cross-module navigation check. Start at https://o2intelligence-v4-dev.metricell.com/launcher. Open API Request Audit, use the browser Back control to return to the launcher, then open Dashboards in the same browser session. Do not create or modify data.
Acceptance criteria:
API Request Audit opens from the launcher and shows its dashboard or request explorer without an application error.
Browser Back returns to the launcher with the Dashboards card visible.
Opening Dashboards shows the current placeholder with its Under construction message and Back to Launcher control, without an application error.
Capture browser evidence and the observed URL at each decisive state.
