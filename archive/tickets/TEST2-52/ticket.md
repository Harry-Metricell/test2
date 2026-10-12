# TEST2-52: Keep the Surveyor layer available while changing Show linked sites in V4 GIS

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: QA review complete
- Jira: https://metricell.atlassian.net/browse/TEST2-52

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

A signed-in V4 user should be able to change Show linked sites in a Surveyor layer's Display Settings without removing the loaded layer or losing access to its legend.
Environment: https://o2intelligence-v4-dev.metricell.com/launcher. Use existing authorised access, open GIS and load an available Surveyor layer with its default configuration.
Acceptance criteria
Opening Display Settings for the loaded Surveyor layer shows Show linked sites with an identifiable checked or unchecked state, and the layer is identifiable in the layer list or legend.
Changing Show linked sites to the opposite state changes the visible checkbox state. After closing Display Settings, the same Surveyor layer remains in the layer list and its legend is available.
Reopening Display Settings for that same layer shows the changed checkbox state without needing to add the layer again.
Scope: verify the visible UI state only; do not claim that linked-site data exists, query results remain unchanged, or settings persist across a reload or a new login. Do not edit saved records. Restore the original checkbox state after testing and remove any layer added solely for this test.
