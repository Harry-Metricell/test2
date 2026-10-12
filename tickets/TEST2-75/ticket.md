# TEST2-75: V4 GIS catalogue: find Surveyor and clear the search without changing the map

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create testing handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-75

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

User story
As a V4 GIS user, I want to locate Surveyor using the layer catalogue search, then return to browsing without changing my active map.
Scope
Start at https://o2intelligence-v4-dev.metricell.com/launcher and open GIS. Authenticate normally if needed. Record the original catalogue position, visible map, and complete active-layer list. Enter Surveyor in the existing Search layers control, check the result, then clear the query using the available control. Do not open configuration, add or remove layers, or change saved data. Finish with an empty query and the original page state.
Acceptance criteria
Entering Surveyor in Search layers leaves that query visible and shows the Surveyor catalogue entry as a matching result.
Clearing the query restores the original catalogue entries and browsing controls at the same recorded catalogue position, with an empty search field.
The active-layer list and visible map do not change during searching or after clearing; the final map and complete active-layer list match their recorded initial state.
Evidence expectations
Provide criterion-specific screenshots showing the original catalogue, matching Surveyor search, and cleared catalogue. For unchanged-state checks, retain readable map and complete active-layer baselines plus matching final views and evidence during the search. Include any required list-scroll views and record the development URL. Existing out-of-scope application warnings must be disclosed; access failures or missing evidence must not be treated as passes.
