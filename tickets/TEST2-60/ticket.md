# TEST2-60: Keep a changed Show linked sites state when closing and reopening GIS Display Settings

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create final evidence review handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-60

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Verify persistence of a deliberately changed setting within the current session, not merely persistence of the default.
Environment: https://o2intelligence-v4-dev.metricell.com/launcher. Use existing authorised access, open GIS and load one test-created Surveyor layer using its defaults. Record the layer identity and Show linked sites initial state. Do not change saved records or other users' layers.
Acceptance criteria
Display Settings for the test-created Surveyor layer shows an identifiable initial Show linked sites checkbox state.
Changing Show linked sites once visibly changes it to the opposite state, without adding another layer.
After changing it to the opposite state, closing and reopening Display Settings for the same layer shows the changed state, not the original; the layer remains loaded.
Changing it back to the recorded original state and closing/reopening Display Settings again shows the original state, with the same layer still loaded.
Each comparison must have its own ordered before/change/reopen evidence and identify the same layer. Scope is checkbox state in one browser session, not linked-site data correctness or reload/login persistence. Restore the original checkbox and remove only the test-created layer during cleanup.
