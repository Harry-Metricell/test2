# TEST2-58: Cancel a second Surveyor layer configuration without disturbing an existing loaded layer

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-58

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Test cancellation with an explicit non-empty Map layers baseline. This avoids relying on an invisible empty-layer state.
Environment: https://o2intelligence-v4-dev.metricell.com/launcher. Use existing authorised access, open GIS and load one test-created Surveyor layer with its default configuration. Record the visible Map layers entries and identity of that layer before opening a second Surveyor Add layer configuration. Do not press Add layer for the second configuration and do not edit saved records.
Acceptance criteria
A settled GIS map visibly shows the existing test-created Surveyor layer in Map layers or the legend; record the current Map layers list before starting the second configuration.
Opening Add layer for Surveyor again displays its identifiable configuration controls and Cancel action while the original layer remains loaded.
Selecting Cancel closes that second configuration and returns to the map. Comparing this journey's before and after Map layers lists shows the same entries, with no extra Surveyor layer added and the original layer still present.
Display Settings can still be opened for the original layer after cancelling; Show linked sites remains in its recorded pre-cancellation state.
Each criterion involving unchanged state must capture its own visible baseline, not reuse another criterion's run. Do not assume cancellation from the absence of a dialog alone. Preserve pre-existing layers/settings; remove only the first layer created for this test during cleanup.
