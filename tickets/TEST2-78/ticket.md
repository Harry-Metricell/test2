# TEST2-78: V4 GIS: search Surveyor and preserve the actual initial map and layer state

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: QA review complete
- Jira: https://metricell.atlassian.net/browse/TEST2-78

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

User story
As a V4 GIS user, I want to find Surveyor in the catalogue and return to my initial browsing view without changing the map or the layers I started with.
Environment and starting conditions
Open https://o2intelligence-v4-dev.metricell.com/launcher with the existing test account, then open GIS and wait for its visible state to settle. Start the catalogue at its top position. Record the actual starting map and selected-layer state independently for each preservation check. Do not open configuration or add/remove layers for this test.
Acceptance criteria
Entering Surveyor in Search layers leaves Surveyor in the search field and shows its matching catalogue entry.
Clearing the Surveyor query leaves the search field empty and restores the same entries and browsing controls visible in the initial top-of-catalogue viewport, at the same browsing position.
The visible map keeps its initial extent and scale while the Surveyor query is present and after it is cleared.
The complete active-layer list keeps its actual initial entries and order while the Surveyor query is present and after it is cleared, with no new layer added. If the settled initial list is empty, it remains empty at both later states; populated entries are not a prerequisite for this preservation check.
Scope and evidence
Catalogue restoration covers only the visible initial viewport, not off-screen or collapsed entries. Active-layer preservation covers the complete selected-layer list, including extra scroll views if there are entries below the viewport. Establish an empty state positively rather than assuming an absent or loading panel is empty. Each criterion needs its own relevant initial, intermediate and final evidence. Report empty-baseline coverage as remained empty, not as a populated reordering test. Existing alerts are outside scope unless these actions change them. No saved changes or new test data are required.
Documentation
Assess guide relevance against existing instructions; add or amend guidance only if this passed ticket identifies a genuine gap.
