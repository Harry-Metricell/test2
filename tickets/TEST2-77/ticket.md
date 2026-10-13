# TEST2-77: V4 GIS: replace an unmatched catalogue query and restore the visible entries

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-77

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

User story
As a V4 GIS user, I want to replace an unsuccessful layer search with a useful query, then clear it to resume browsing the same visible catalogue entries without changing my map.
Environment
https://o2intelligence-v4-dev.metricell.com/launcher
Open GIS using the existing test account. Use Search layers in the left-hand catalogue. No layer configuration, layer creation, or saved changes are needed.
Acceptance criteria
At the top of the catalogue, entering TEST2-no-match-rehearsal-20261013 keeps the exact query visible and shows no matching catalogue entries, including no Surveyor result.
Replacing that query with Surveyor without reloading keeps Surveyor visible in the search field and displays its matching catalogue entry.
Clearing the query leaves the search field empty and restores the same catalogue entries and browsing controls visible in the initial top-of-catalogue viewport, at the same browsing position.
The visible map retains its initial extent and scale, and the complete active-layer list retains its initial entries and order throughout the query changes and after clearing. No new layer is added.
Evidence scope
Catalogue restoration concerns only the visible initial viewport, not every off-screen or collapsed catalogue item. Record the initial visible catalogue and matching final cleared view, plus the no-match and Surveyor result states. Map and complete active-layer comparisons need their own baseline, intermediate and final evidence; if the active-layer list requires scrolling, capture all its entries. Do not interpret the visible catalogue criterion as an assertion about the complete catalogue. Disclose pre-existing alerts separately from changes caused by the tested actions.
Guide relevance
Assess this as an ordinary ticket against the existing guide. Reuse existing guidance when it already covers the behaviour; do not force a new section.
