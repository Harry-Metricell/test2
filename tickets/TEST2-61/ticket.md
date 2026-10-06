# TEST2-61: Recover the GIS layer catalogue from a no-match search without changing loaded layers

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-61

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Exercise a negative search result followed by recovery while real map content is loaded.
Environment: https://o2intelligence-v4-dev.metricell.com/launcher. Use existing authorised access, open GIS and load one test-created Surveyor layer using defaults. Record the visible Map layers list, layer identity, empty Search layers field, Surveyor and a non-Surveyor catalogue entry such as Beacons. Use Search layers, not Search Map.
Acceptance criteria
Before filtering, the unfiltered catalogue shows Surveyor and the recorded non-Surveyor entry; the test-created layer is identifiable in Map layers or the legend.
Entering the deliberately non-matching text TEST2_NO_SUCH_LAYER_20261006 in Search layers makes both recorded catalogue entries absent from the filtered catalogue. The entered search text remains visible and the existing Map layers list is unchanged.
Clearing Search layers restores both recorded catalogue entries and leaves the original Map layers list unchanged, without adding or removing any layer.
A subsequent search for Surveyor shows the matching entry; clearing it again restores the original catalogue and the same loaded layers. No error page or sign-in screen interrupts the search journey.
Do not require a specific no-results message or invent an empty-state label: evidence must show the actual filtered catalogue, search text and complete loaded-layer list. Capture each criterion's own before/after states. Restore the initial search text and remove only the layer created for this test; preserve existing layers.
