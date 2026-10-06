# TEST2-56: Cancel adding a Surveyor layer without changing the GIS layer list

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Unverified
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create final evidence review handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-56

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

A user should be able to inspect the Surveyor add-layer dialog and cancel without adding a layer.
Environment: https://o2intelligence-v4-dev.metricell.com/launcher. Start from the launcher using existing authorised access. Check visible in-session behaviour only; do not edit saved records or change account permissions.
Acceptance Criteria
In the settled GIS workspace, record the visible current Map layers list or empty-layer state. Selecting Add layer for Surveyor opens its configuration dialog with identifiable controls and a Cancel action.
Selecting Cancel closes that dialog and returns to the GIS map. The Map layers list retains its recorded entries or empty state, and no new Surveyor layer is added.
Opening the Surveyor add-layer dialog again displays the configuration controls and Cancel action, and cancelling again returns to the map without adding a layer.
Scope: use Cancel, never the dialog's confirmation/Add layer action. Do not remove pre-existing layers, edit saved records or change filter values. The unchanged-layer assertion must be evidenced by visible before/after layer-list states, not an inferred backend claim.
