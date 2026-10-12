# TEST2-73: V4 GIS layer search: clear an unmatched query and restore the catalogue

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-73

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

User story
As a V4 GIS user, I want to clear a layer search that returns no matches so I can browse the available layers again without changing my map.
Test scope
Use https://o2intelligence-v4-dev.metricell.com/launcher and open the GIS module. Authenticate normally if prompted. Use the existing layer catalogue search; this is a read-only UI test, not a request to create data or change configuration. Record the initial catalogue, visible map and active-layer state before searching. Enter a distinctive unmatched query such as TEST2-showcase-no-match-20261012. Clear it using the available search control, then leave the page in its original state.
Acceptance criteria
Entering an unmatched query in the GIS layer catalogue search filters out unrelated catalogue entries; the entered query remains visible and the interface does not present unrelated layers as matches.
Clearing the query restores the initial catalogue contents and browsing controls. Compare the same catalogue position before and after clearing, including any scrolling needed to establish that the original entries have returned.
Searching and clearing do not change the initially active layers or visible map state. The final query is empty and the catalogue, map and active-layer state match the recorded initial state.
Evidence expectations
Capture readable, URL-attributed evidence for the initial state, unmatched search, and restored state. Keep before/after views comparable and associate each acceptance criterion with its decisive evidence. Report genuine access or application failures honestly; do not infer success from missing evidence.
