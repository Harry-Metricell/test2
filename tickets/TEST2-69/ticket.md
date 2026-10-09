# TEST2-69: Cancel two different unsaved Surveyor usernames and reopen a clean configuration

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create user-guide impact assessment handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-69

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Purpose
Verify repeated abandonment of unsaved Surveyor filter edits, extending the existing guide's single-cancellation workflow.
Setup and scope
Start at https://o2intelligence-v4-dev.metricell.com/launcher using authorised test access. Open GIS and record the original map view and complete Map layers entries/order (an absent list is valid). Open Surveyor configuration. Use only synthetic usernames; never select Add layer, save data, or change existing layers/settings.
Acceptance criteria
Enter TEST2-unsaved-first in Username. The complete value is visibly present before selecting Cancel; cancellation closes the configuration dialog.
Reopen Surveyor configuration. Username is empty, with neither the first value nor any part of it retained.
Enter TEST2-unsaved-second in Username. The complete second value is visible before selecting Cancel; cancellation closes the dialog again.
Reopen Surveyor configuration once more. Username is empty again and Cancel and Add layer are available. Cancel to finish; the original Map layers entries/order and map view remain unchanged with no new Surveyor layer.
Evidence and cleanup
Capture each edited value, cancellation and reopened field in sequence, plus original/final layer-state comparison and URL records. Leave the dialog closed and preserve pre-existing state.
Documentation relevance
The living guide already has “Opening and cancelling Surveyor configuration in V4 GIS”. If passing evidence reveals useful missing guidance about repeated edits/reset, amend that section instead of creating another. Retain existing useful instructions and highlight new/changed content in yellow; if fully covered already, no update is needed.
