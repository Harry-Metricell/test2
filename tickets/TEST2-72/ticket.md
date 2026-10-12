# TEST2-72: V4 Surveyor configuration: discard an unsaved Username edit

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-72

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

User story
As a GIS user, I want Cancel to discard an unsaved Surveyor filter edit without adding a layer or changing the map.
Scope and setup
Start at https://o2intelligence-v4-dev.metricell.com/launcher using authorised V4 access. Use only normal UI controls. Open GIS and record the unobscured settled map view and complete existing Map layers entries/order. An absent list is a valid baseline. Open Surveyor configuration from its catalogue control. Use only the synthetic value TEST2-showcase-unsaved. Do not select Add layer, save data, change existing layers or modify saved settings.
Acceptance criteria
Surveyor configuration displays Username, Cancel and Add layer controls. Enter TEST2-showcase-unsaved; the entire value is visibly present in Username before cancellation.
Select Cancel, then reopen Surveyor configuration. The reopened Username field is empty, with Cancel and Add layer available.
Cancel the reopened dialog to finish. The unobscured map view and complete Map layers entries/order match the original pre-dialog baseline, with no new Surveyor layer.
Evidence and cleanup
Capture the edited value, closed dialog, reopened empty field and final restored map. Put the original/final comparison states in the evidence for the unchanged-state criterion, using that criterion's own journey. Record actual browser-derived final URLs. Leave the dialog closed and preserve all pre-existing state.
User-guide relevance
Use the existing “Opening and cancelling Surveyor configuration in V4 GIS” section. Amend it only if passing evidence establishes a genuine missing instruction; otherwise no guide change is needed. Preserve existing useful guidance and highlight any new/changed content in yellow.
