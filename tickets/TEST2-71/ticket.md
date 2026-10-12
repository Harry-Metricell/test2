# TEST2-71: V4 GIS catalogue search: recover from no matching layers

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-71

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

User story
As a GIS user, I want to recover from a catalogue search that finds nothing so I can find Surveyor and continue using the map.
Scope and setup
Start at https://o2intelligence-v4-dev.metricell.com/launcher using authorised V4 access. Use only normal UI controls. Open GIS and wait for the map/catalogue to settle. With Search layers empty, record the unfiltered catalogue, map view and complete existing Map layers list/order. An absent Map layers list is a valid baseline. Do not add/remove layers, zoom/pan the map or change saved settings. Use Search layers, not Search Map.
Acceptance criteria
Enter zzqa_showcase_no_match_20261012 into Search layers. The entered text remains visible and no matching catalogue entries are shown; the GIS map remains available. No particular no-results wording is required.
Replace the no-match text with Surveyor without reloading GIS. Surveyor appears in the filtered catalogue and the map remains available.
Clear Search layers. The original catalogue returns, and the complete Map layers entries/order and map view match the recorded pre-search baseline, without an added or removed layer.
Evidence and cleanup
Capture this criterion's own original baseline and decisive no-match/recovery/restored states. For unchanged-state comparisons, show unobscured original and restored map/layer lists. Record the actual browser URL at each final assertion. Leave the search empty and preserve all pre-existing state.
User-guide relevance
Assess existing search-recovery guidance; amend only a verified material gap and avoid duplicate instructions.
