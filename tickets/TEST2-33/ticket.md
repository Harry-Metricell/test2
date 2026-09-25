# TEST2-33: Use the GIS map zoom controls

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Blocked
- Workflow state: Retry Queued
- Action owner: Coordinator
- Next action: Retry 2/3 queued; coordinator will start tester
- Jira: https://metricell.atlassian.net/browse/TEST2-33

## Acceptance Criteria

1. With GIS loaded, the map's zoom-in (+) and zoom-out (-) controls are visible and usable.
2. Selecting zoom-in (+) once increases the map zoom level, visibly showing a smaller geographic area without an application error.
3. Selecting zoom-out (-) once then decreases the map zoom level, visibly showing a larger geographic area without an application error.

## Subtasks

No subtasks imported.

## Description

Verify the basic map zoom controls in the V4 GIS module.
Start at https://o2intelligence-v4-dev.metricell.com/launcher and sign in if prompted. Open GIS and wait for the base map to finish loading. This test requires no saved data changes or particular data layer.
Acceptance criteria:
With GIS loaded, the map's zoom-in (+) and zoom-out (-) controls are visible and usable.
Selecting zoom-in (+) once increases the map zoom level, visibly showing a smaller geographic area without an application error.
Selecting zoom-out (-) once then decreases the map zoom level, visibly showing a larger geographic area without an application error.
