# TEST2-49: Verify reversible Show linked sites change in V4 GIS

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create testing handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-49

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

A signed-in V4 user should be able to change the Show linked sites setting in a Surveyor layer's Display Settings and restore the original state. This test checks the visible setting without requiring a second account or a special data fixture.
Start at the V4 launcher on https://o2intelligence-v4-dev.metricell.com/ and use an available Surveyor layer in GIS.
Acceptance Criteria
After opening GIS and loading an available Surveyor layer, the layer legend displays a Display Settings control.
Opening Display Settings displays Show linked sites with a clearly identifiable initial checked or unchecked state.
Changing Show linked sites to the opposite state visibly changes the control from its initial state to the new state.
Restoring Show linked sites to its initial state, then closing and reopening Display Settings, displays the same initial state. The setting is left in its original state after testing.
