# TEST2-59: Filter and clear the GIS layer catalogue while preserving a loaded Surveyor layer

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create testing handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-59

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Test that catalogue search is independent of the layers already loaded on the map.
Environment: https://o2intelligence-v4-dev.metricell.com/launcher. Use existing authorised access, open GIS, and load one test-created Surveyor layer with its default configuration. Use the visible Search layers catalogue field, not Search Map. Record the initial catalogue and current Map layers entries. Identify a visible non-Surveyor catalogue entry (for example Beacons) for the search comparison.
Acceptance criteria
The unfiltered catalogue shows Surveyor and the recorded non-Surveyor entry; the loaded test-created Surveyor layer is identifiable in Map layers or the legend.
Entering Surveyor in Search layers leaves a matching Surveyor catalogue entry visible and excludes the recorded non-matching entry from the filtered catalogue. The previously loaded layer remains in Map layers or the legend without being added again.
Clearing Search layers restores the recorded non-Surveyor catalogue entry. The current Map layers entries match the recorded pre-search list, with no duplicate or removed layer.
Display Settings for the same loaded Surveyor layer remains accessible after filtering and clearing; its Show linked sites state matches the state recorded before the search journey.
Capture the search text, catalogue results and loaded-layer context for each decisive state; capture full before/after lists for unchanged-list assertions. Scope is current-session visible UI behaviour only, not server-query correctness or reload persistence. Do not alter saved records or other users' layers. Restore the initial search text and checkbox state; remove only the layer created for this test.
