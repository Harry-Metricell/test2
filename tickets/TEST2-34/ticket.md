# TEST2-34: Verify V4 launcher opens GIS and browser Back returns to launcher

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-34

## Acceptance Criteria

1. The V4 launcher displays a GIS module card with an enabled Open GIS control.
2. Selecting Open GIS navigates to https://o2intelligence-v4-dev.metricell.com/gis and displays the GIS page without an application error.
3. Using the browser Back button returns to https://o2intelligence-v4-dev.metricell.com/launcher, where the GIS card is visible again.
4. This ticket tests navigation only; it does not require map-layer or zoom functionality.

## Subtasks

No subtasks imported.

## Description

Small regression test for launcher-to-GIS navigation on the V4 development site.
Test from https://o2intelligence-v4-dev.metricell.com/launcher. Sign in if prompted.
Acceptance criteria:
The V4 launcher displays a GIS module card with an enabled Open GIS control.
Selecting Open GIS navigates to https://o2intelligence-v4-dev.metricell.com/gis and displays the GIS page without an application error.
Using the browser Back button returns to https://o2intelligence-v4-dev.metricell.com/launcher, where the GIS card is visible again.
This ticket tests navigation only; it does not require map-layer or zoom functionality.
