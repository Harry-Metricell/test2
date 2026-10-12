# TEST2-50: Confirm Show linked sites can be changed and restored in V4 GIS Display Settings

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: QA review complete
- Jira: https://metricell.atlassian.net/browse/TEST2-50

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Users need to change the Show linked sites setting on a Surveyor layer and retain the selected control state when Display Settings is closed and reopened.
Environment: https://o2intelligence-v4-dev.metricell.com/ . Open GIS from the launcher using an authorised account and load an available Surveyor layer. This ticket concerns the displayed checkbox state; it does not claim that linked-site data is available or that a backend preference persists across a new session.
Acceptance criteria
The loaded Surveyor layer legend exposes Display Settings, and opening it displays the Show linked sites control with an identifiable initial checked or unchecked state.
Selecting Show linked sites changes the displayed control to the opposite checked or unchecked state.
Closing and reopening Display Settings retains the changed state of Show linked sites.
Restoring Show linked sites to its recorded initial state, then closing and reopening Display Settings, displays that original state again.
Leave the original control state restored and remove any layer created only for this test. Use existing authorised access and available layer data; do not create or alter production records.
