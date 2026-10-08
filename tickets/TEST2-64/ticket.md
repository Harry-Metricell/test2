# TEST2-64: Recover the V4 GIS layer catalogue after a search with no matching layers

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create testing handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-64

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Description
A V4 user should be able to search the GIS layer catalogue, see an empty result when no layer matches, then clear the search and use the catalogue again without disrupting the map.
Preconditions and scope
Start at https://o2intelligence-v4-dev.metricell.com/launcher using the authorised V4 test account. Open GIS and wait for the map and layer catalogue to settle. With Search layers empty, record the visible catalogue groups and Surveyor entry, the current map view, and any existing Map layers entries and their order. An initially absent Map layers list is a valid baseline; no loaded layer is required. Do not add, remove or reconfigure layers, change map position or zoom, or change saved settings.
Acceptance criteria
Enter Surveyor in Search layers. The entered text stays visible and the filtered catalogue displays Surveyor; the GIS map remains visible.
Replace the search text with zzqa_no_layer_match_20261008. That text stays visible and no matching layer entries are displayed. GIS remains usable with the map visible, rather than showing an application-error page or sign-in screen. An explicit no-results message is not required.
Clear Search layers using its normal UI control. The search field becomes empty and the original visible catalogue groups and Surveyor entry return. The existing loaded Map layers entries and their order match the recorded baseline; if no Map layers list existed initially, none has been created.
Enter Surveyor once more after clearing the no-match search. Surveyor is visible in the filtered catalogue again and the map remains visible, demonstrating that catalogue search still works after the empty-result state.
Cleanup
After final assertion evidence, clear Search layers and leave all pre-existing loaded layers and saved settings unchanged.
User documentation relevance
This is an existing catalogue-search workflow. Check whether the living guide already explains recovering from a no-match search; only amend existing instructions if there is a genuine documentation gap.
