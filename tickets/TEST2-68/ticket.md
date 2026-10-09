# TEST2-68: Recover GIS catalogue search from no matches and open Surveyor configuration

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create testing handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-68

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Purpose
Verify that a negative catalogue search does not prevent subsequent configuration access.
Setup and scope
Start at https://o2intelligence-v4-dev.metricell.com/launcher using authorised test access. Open GIS, clear Search layers, and record visible catalogue entries, map view and all existing Map layers entries/order. An absent Map layers list is a valid baseline. Do not add/remove layers, move/zoom the map or change saved settings. Use Search layers, not Search Map.
Acceptance criteria
Enter zzqa_no_match_batch_20261009 in Search layers. The entered text stays visible and no matching catalogue entries are displayed, while the GIS map remains available. No specific empty-state wording is required.
Replace that text with Surveyor. The matching Surveyor catalogue entry becomes visible again without reloading GIS.
Open the configuration control beside the filtered Surveyor entry. Surveyor configuration displays Username, Cancel and Add layer controls.
Select Cancel and clear Search layers. The original catalogue entries return and the existing Map layers entries/order and map view match the recorded baseline, with no new layer added.
Evidence and cleanup
Capture the baseline, no-match state, recovered Surveyor entry, open dialog and final restored state with URL records. Leave search empty and dialog closed; preserve all pre-existing layers.
Documentation relevance
Assess whether existing search recovery instructions cover opening configuration after recovery. Amend an existing section only if a real documentation gap is demonstrated.
