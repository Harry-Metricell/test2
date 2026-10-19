# TEST2-74: V4 Surveyor: cancelling an unsaved Username leaves the map unchanged

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: QA review complete
- Jira: https://metricell.atlassian.net/browse/TEST2-74

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

User story
As a V4 GIS user, I want to cancel an unfinished Surveyor layer configuration without saving the entered Username or changing my existing map.
Scope
Start at https://o2intelligence-v4-dev.metricell.com/launcher, authenticate normally if needed, and open GIS. Record the initial visible map and complete active-layer list. Open the existing Surveyor layer configuration from the catalogue. Use the synthetic Username TEST2-rehearsal-unsaved-20261012. Cancel without pressing Add layer or otherwise saving. Reopen the same configuration to check the discarded input, then cancel again to leave the page in its original state. Do not create records, add layers, change account settings or submit credentials through the Username field.
Acceptance criteria
Opening Surveyor configuration presents an editable Username field and the Cancel and Add layer controls.
After entering the synthetic Username and cancelling, reopening Surveyor configuration shows an empty Username field rather than the discarded value.
After cancelling the reopened configuration, the visible map and complete active-layer list match the recorded initial state; no Surveyor layer has been added by this sequence.
Evidence
Capture readable criterion-specific evidence for the initial map and active layers, entered Username before cancellation, reopened empty field, and final restored map and active layers. Pair comparable original/restored views in the report and record the development URL. Preserve any necessary list-scroll evidence. Disclose real application or access problems rather than assuming a pass.
