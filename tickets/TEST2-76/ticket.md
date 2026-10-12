# TEST2-76: V4 GIS: recover from an unmatched catalogue search and cancel Surveyor configuration

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create final evidence review handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-76

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

User story
As a V4 GIS user, I want to recover from a layer search with no matching result, find Surveyor, and inspect its configuration without adding a layer or changing my map.
Environment
Development V4: https://o2intelligence-v4-dev.metricell.com/launcher
Use the existing authenticated test account. Open GIS from the launcher and use the Search layers control in its catalogue.
Acceptance criteria
With the GIS catalogue open, entering the unique query TEST2-no-match-showcase-20261012 leaves that query visible and shows no matching catalogue entries, including no Surveyor result.
Replacing that query with Surveyor, without reloading the page, shows the Surveyor matching entry. Opening its configuration displays an editable Username field and Cancel and Add layer controls.
Entering the synthetic Username TEST2-showcase-unsaved-20261012, selecting Cancel without Add layer, and reopening the same configuration shows an empty Username field.
After cancelling the reopened configuration and clearing the catalogue query, the search field is empty and the original catalogue entries and browsing position are restored. The visible map and complete active-layer list remain the same as their recorded initial states, with no Surveyor layer added.
Scope
Catalogue search and unsaved configuration only. No saved changes, layer creation, real customer identifiers, or unrelated module checks. An already-present map-layer error is outside this ticket unless these actions change it. This is a normal functional rehearsal ticket; assess guide relevance against the existing guide rather than forcing an amendment.
