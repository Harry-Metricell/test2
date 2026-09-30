# TEST2-47: Verify Surveyor Display Settings in V4 GIS

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-47

## Acceptance Criteria

1. Presentation controls are available for a loaded Surveyor layer.
2. Changing presentation settings does not change the underlying filtered result set.
3. Display Settings appears beneath the Surveyor legend.
4. The available controls include active legend/colouring, Show Linked Sites, Show Linked Cells when linked sites and the zoom gate allow it, Colour Point Links By Azimuth/Band only for the Band legend with linked sites shown, and Show Labels only for Building.
5. No Sector control is exposed.
6. Options persist across normal GIS state restoration.
7. Validation: Load a Surveyor layer in V4 GIS, inspect the layer-owned Display Settings, exercise controls whose prerequisites are available, and check persistence. Distinguish unavailable data or permissions from failed UI behaviour; do not infer unchanged query results from screenshots alone. This depends on the Surveyor catalogue and layer fixture/adapter and may need suitable account access and data.

## Subtasks

No subtasks imported.

## Description

Source: https://metricell.atlassian.net/browse/VM2ST-231
Copied from a Done VMO2 SmartTools subtask for TEST2 browser QA. The SmartTools issue remains unchanged.
Purpose: Provide the Surveyor-owned Display Settings control beneath the V4 GIS legend.
Acceptance criteria:
Presentation controls are available for a loaded Surveyor layer.
Changing presentation settings does not change the underlying filtered result set.
Display Settings appears beneath the Surveyor legend.
The available controls include active legend/colouring, Show Linked Sites, Show Linked Cells when linked sites and the zoom gate allow it, Colour Point Links By Azimuth/Band only for the Band legend with linked sites shown, and Show Labels only for Building.
No Sector control is exposed.
Options persist across normal GIS state restoration.
Validation: Load a Surveyor layer in V4 GIS, inspect the layer-owned Display Settings, exercise controls whose prerequisites are available, and check persistence. Distinguish unavailable data or permissions from failed UI behaviour; do not infer unchanged query results from screenshots alone. This depends on the Surveyor catalogue and layer fixture/adapter and may need suitable account access and data.
