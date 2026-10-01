# TEST2-48: Toggle linked sites visibility in V4 GIS Surveyor Display Settings

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create testing handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-48

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

In V4 GIS, a signed-in user with access to an available Surveyor layer can change whether linked sites are shown. Verify the visible control and a reversible change without requiring a second account or a special data fixture.
Acceptance Criteria
Starting from the V4 launcher, open GIS, load an available Surveyor layer, and verify that its legend includes a Display Settings control.
Open Display Settings and verify that the Show linked sites control is visible with a discernible current state.
Change Show linked sites to the opposite state and verify that the control displays the new state.
Restore Show linked sites to its original state, reopen Display Settings, and verify that the original state is displayed.
