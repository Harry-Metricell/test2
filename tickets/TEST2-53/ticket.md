# TEST2-53: Restore Show linked sites after two changes in V4 GIS

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: QA review complete
- Jira: https://metricell.atlassian.net/browse/TEST2-53

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

A signed-in V4 user should be able to change Show linked sites and return it to its original state without removing the Surveyor layer.
Environment: https://o2intelligence-v4-dev.metricell.com/launcher. Use existing authorised access, open GIS and load an available Surveyor layer with its default configuration.
Acceptance criteria
Opening Display Settings for the loaded Surveyor layer displays Show linked sites with an identifiable checked or unchecked state, and the layer is identifiable in the layer list or legend.
Changing Show linked sites to the opposite state visibly changes the checkbox; changing it again visibly restores the recorded original state without adding the layer again.
After changing Show linked sites to the opposite state and restoring it, closing and reopening Display Settings for that same layer displays the original checkbox state; the layer remains available without being added again.
Scope: check the visible control state within the current session only. Do not claim linked-site data is available, query results are unchanged, or the setting persists across a reload or a new login. Do not edit saved records. Leave the original control state restored and remove any layer added solely for this test.
