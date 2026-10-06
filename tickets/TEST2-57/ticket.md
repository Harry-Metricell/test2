# TEST2-57: Zoom the GIS map without losing a loaded Surveyor layer or its display setting

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create final evidence review handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-57

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Exercise map navigation while a real layer is loaded, rather than testing an empty map.
Environment: https://o2intelligence-v4-dev.metricell.com/launcher. Use existing authorised access. Open GIS and add one test-created Surveyor layer using the default configuration. Record its visible identity, Map layers entry/legend and the current Show linked sites checkbox state in Display Settings. Close Display Settings before zooming. Do not modify or remove layers belonging to other users.
Acceptance criteria
The test-created Surveyor layer is visibly identifiable in Map layers or the legend, and its Display Settings shows an identifiable Show linked sites state.
From a recorded settled map scale with that layer loaded, selecting zoom-in once produces a closer settled map scale; the same Surveyor layer remains visible in Map layers or the legend.
After that zoom-in, selecting zoom-out once returns to the recorded initial map scale, and the same loaded layer remains available without adding it again.
Opening Display Settings for the same layer after the zoom-in/zoom-out journey shows the originally recorded Show linked sites state.
Evidence: each comparison must show its own before and after states, including scale and layer identity. No claim about linked-site data completeness or persistence across reload/login. If prerequisite data is unavailable, identify it rather than substitute another feature. Restore the original checkbox and remove only the layer created for this test.
