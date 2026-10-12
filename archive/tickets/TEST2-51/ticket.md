# TEST2-51: Reopen Surveyor Display Settings without losing the loaded V4 GIS layer

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: QA review complete
- Jira: https://metricell.atlassian.net/browse/TEST2-51

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Users should be able to close and reopen a Surveyor layer's Display Settings without removing the layer or changing the Show linked sites selection merely by opening or closing the panel.
Environment: https://o2intelligence-v4-dev.metricell.com/ . Open GIS from the launcher with existing authorised access and load an available Surveyor layer using its default configuration.
Acceptance criteria
After the Surveyor layer is loaded, its layer legend shows the layer name and a Display Settings control.
Opening Display Settings displays Show linked sites with a clearly identifiable checked or unchecked state.
Closing Display Settings dismisses the settings panel while the same Surveyor layer remains in the layer list and its legend remains available.
Reopening Display Settings for that same layer displays Show linked sites in the same state observed before closing it, without requiring the layer to be added again.
Scope: do not change the checkbox or assert persistence across a page reload or new login session. Do not edit backend data. If a layer was added solely for this test, remove it after evidence collection; this is test cleanup, not a user-guide step.
