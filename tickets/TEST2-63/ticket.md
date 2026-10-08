# TEST2-63: Filter the V4 GIS layer catalogue for Surveyor and restore the original view

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create final evidence review handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-63

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Description
A V4 user should be able to find Surveyor in the GIS layer catalogue using Search layers, then clear the search and return to the original catalogue without changing the map's loaded layers during that search-and-clear journey.
Preconditions and permitted setup
Use the authorised V4 test account at https://o2intelligence-v4-dev.metricell.com/launcher and open GIS. Wait for the map and layer catalogue to settle. Record any existing loaded layers first. If no Map layers list is visible, use the normal Surveyor controls to add exactly one temporary Surveyor layer using its default configuration. If a Map layers list is already visible, one temporary Surveyor layer may still be added when needed to make the test-owned layer unambiguously identifiable. Record which layer belongs to this test, the complete resulting Map layers entries and their order, and the original unfiltered catalogue. The comparison baseline is recorded AFTER setup and BEFORE entering Search layers. Do not add, remove or reconfigure layers during the search-and-clear journey.
Acceptance criteria
After permitted setup, with GIS open and Search layers empty, the catalogue visibly contains Surveyor and the loaded Map layers entries and their order are recorded as the pre-search baseline, including the identifiable temporary Surveyor layer if one was created.
After entering Surveyor in Search layers, the entered text remains visible and Surveyor is visible in the filtered catalogue; the loaded Map layers entries and their order remain identical to the recorded post-setup, pre-search baseline.
After clearing Search layers, the original catalogue entries return and the loaded Map layers list contains the same entries in the same order as the recorded post-setup, pre-search baseline.
The search-and-clear journey remains in GIS without an application-error page or sign-in screen interrupting it, and the map remains visible after the original catalogue has been restored.
Cleanup
After capturing the final search-and-clear state, clear any remaining search text and remove ONLY the temporary layer created by this test. Confirm that all pre-existing loaded layers remain in their original order. If the temporary layer cannot be distinguished safely, do not remove any pre-existing layer; report the cleanup limitation. No administrative changes or persisted configuration changes are required.
User documentation relevance
This is an existing user-facing catalogue-search workflow. Assess whether the living guide already describes it accurately; amend the existing instructions only if needed rather than adding a duplicate section.
