# TEST2-40: Navigate from GIS back to the launcher and into API Request Audit

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: QA review complete
- Jira: https://metricell.atlassian.net/browse/TEST2-40

## Acceptance Criteria

1. Opening GIS from the launcher displays the GIS map view and its visible controls without an application error.
2. The browser Back control returns to the V4 launcher, where the module cards are visible.
3. Opening API Request Audit from that launcher displays its dashboard or request explorer without an application error.
4. Capture browser evidence and the observed URL at each decisive state.

## Subtasks

No subtasks imported.

## Description

V4 read-only cross-module navigation check. Start at https://o2intelligence-v4-dev.metricell.com/launcher. Open GIS, return to the launcher using the browser Back control, then open API Request Audit in the same browser session. Do not change saved data, layers, or audit records.
Acceptance criteria:
Opening GIS from the launcher displays the GIS map view and its visible controls without an application error.
The browser Back control returns to the V4 launcher, where the module cards are visible.
Opening API Request Audit from that launcher displays its dashboard or request explorer without an application error.
Capture browser evidence and the observed URL at each decisive state.
