# TEST2-65: Cancel and reopen Surveyor configuration in V4 GIS without adding a layer

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create user-guide impact assessment handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-65

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Description
A V4 user should be able to inspect Surveyor configuration, cancel without adding a layer, and reopen the configuration when needed. Cancelling must preserve the existing loaded-layer state.
Preconditions and scope
Start at https://o2intelligence-v4-dev.metricell.com/launcher using the authorised V4 test account. Open GIS and wait for the map and catalogue to settle. Clear Search layers if necessary. Record the complete existing Map layers entries and their order and the current map view before opening Surveyor configuration. An absent Map layers list is a valid baseline; no loaded layer is required. Use the Surveyor entry's normal add/configuration control to open its configuration dialog. Do not press Add layer or change filters, saved settings, map position, zoom, or existing layers.
Acceptance criteria
Opening Surveyor configuration from the GIS catalogue displays the Surveyor configuration dialog with a visible Cancel control and an Add layer control. No layer has been added merely by opening the dialog.
Selecting Cancel closes the dialog and returns to GIS with the map and layer catalogue visible. The loaded Map layers entries and their order match the recorded pre-dialog baseline; if the list was absent initially, it remains absent.
Opening Surveyor configuration again after cancelling displays the configuration dialog with its Cancel and Add layer controls available, showing that cancelling has not prevented reopening it.
Cancelling the reopened dialog returns to GIS with the original loaded-layer state still intact and without an application-error page or sign-in screen interrupting the journey.
Cleanup
Leave the configuration dialog closed and Search layers empty. Do not add or remove any layer. Preserve all pre-existing loaded layers and saved settings.
User documentation relevance
Assess whether the living guide already explains opening and cancelling Surveyor configuration. Amend an existing section only for a genuine missing or inaccurate instruction, not simply because another QA test passed.
