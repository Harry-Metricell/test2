# TEST2-66: Cancel edited Surveyor configuration without applying it to the GIS map

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create user-guide update authoring handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-66

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Purpose
Verify the user-facing workflow for abandoning changes in Surveyor configuration. The existing user guide section, “Opening and cancelling Surveyor configuration in V4 GIS”, covers opening and cancelling an untouched dialog but does not explain cancelling after entering a filter value. If the behaviour passes, update that existing section with the verified workflow rather than adding a duplicate section.
Environment and setup
Use https://o2intelligence-v4-dev.metricell.com/launcher and open GIS. Record the initial visible map and Map layers state; an absent Map layers panel is a valid baseline. Open Surveyor configuration using the control beside Surveyor in the layer catalogue. Do not select Add layer, save a survey, or change shared data.
Acceptance criteria
Surveyor configuration opens and displays the Username field and Cancel and Add layer controls.
Enter the temporary value TEST2-cancel-check in Username. The value is visibly present in the dialog before cancellation.
Select Cancel. The dialog closes and GIS returns with the original visible map and Map layers state unchanged; no new Surveyor layer is added.
Reopen Surveyor configuration. The dialog is usable and Cancel and Add layer remain available. Cancel again to finish without adding a layer, leaving the original map/layer state intact.
Documentation context
The guide should explain how to abandon an edited configuration and that this flow does not add a layer. Observe what happens to the entered Username value on reopening, but do not assume it resets or persists: document only behaviour supported by evidence. Any amendment should replace/enrich the existing Surveyor section, retain useful existing instructions, and highlight new or changed text in yellow.
Evidence
Capture the initial map/layer baseline, the edited Username value before cancellation, the unchanged map/layer state after cancellation, and the reopened dialog. Include the URL in evidence records. No real username or personal data is needed.
