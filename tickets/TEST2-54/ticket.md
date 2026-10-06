# TEST2-54: Zoom and reset the V4 GIS map

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create testing handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-54

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

A user should be able to zoom the GIS map and return to its starting view using the map controls.
Environment: https://o2intelligence-v4-dev.metricell.com/launcher. Start from the launcher using existing authorised access. Check visible in-session behaviour only; do not edit saved records or change account permissions.
Acceptance Criteria
Opening GIS from the launcher displays a settled map with visible zoom-in and reset-map-view controls.
With the initial map view recorded, selecting zoom-in once produces a visibly closer map view after it settles; the GIS workspace and map controls remain available.
Selecting reset map view after zooming returns to the initial default map extent, demonstrated by the visible geographic coverage and scale, with the GIS controls still available.
Scope: use the map controls only. Do not add layers, query data or modify saved records. Leave the map at its default view. Do not require exact pixel equality between animated maps.
