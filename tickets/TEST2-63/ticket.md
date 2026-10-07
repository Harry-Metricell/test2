# TEST2-63: Filter the V4 GIS layer catalogue for Surveyor and restore the original view

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-63

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Description
A V4 user should be able to find Surveyor in the GIS layer catalogue using Search layers, then clear the search and return to the original catalogue without changing the map's loaded layers.
Preconditions
Use the authorised V4 test account at https://o2intelligence-v4-dev.metricell.com/launcher and open GIS. Wait for the map and layer catalogue to settle. Record the original catalogue and loaded Map layers list before searching. Use the existing configuration; adding or removing a layer is not needed.
Acceptance criteria
With GIS open and Search layers empty, the layer catalogue includes a visible Surveyor entry, and the currently loaded Map layers list can be recorded as the baseline for this journey.
After entering Surveyor in Search layers, the entered text remains visible and a Surveyor catalogue entry is visible in the filtered catalogue without loading or removing a map layer.
After clearing Search layers, the original catalogue entries return and the loaded Map layers list has the same entries in the same order as the recorded pre-search baseline.
The search-and-clear journey remains in GIS without an application-error page or sign-in screen interrupting it, and the map remains visible after the original catalogue has been restored.
User documentation relevance
This is an existing user-facing catalogue-search workflow. Assess whether the living guide already describes it accurately; amend the existing instructions only if needed rather than adding a duplicate section.
