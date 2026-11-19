# TEST2-93: GIS: switch between base map styles

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create testing handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-93

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

On O2 V4 development, users need to choose a base map that makes the area they are inspecting easy to read. Verify the Map style control in GIS using an ordinary map view. No data edits, extra layers or special fixtures are required.
Acceptance criteria
The Map style control opens a chooser with the current style and at least one alternative.
Selecting an alternative changes the visible base map while keeping the same location and zoom level. Use recognisable map features or the scale bar to compare before and after.
Selecting the original style restores the original base map.
Capture the style chooser and the changed map as separate screenshots so the control and the resulting map are both visible.
