# TEST2-42: Return from Agentic AI to the launcher and open GIS

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create testing handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-42

## Acceptance Criteria

1. Selecting the Agentic AI launcher card opens its module view without an application error.
2. Browser Back returns to the V4 launcher with the GIS card visible.
3. Selecting GIS from that launcher opens the GIS map view with visible map controls and no application error.
4. Capture browser evidence and the observed URL at each decisive state.

## Subtasks

No subtasks imported.

## Description

V4 read-only cross-module navigation check. Start at https://o2intelligence-v4-dev.metricell.com/launcher. Open the Agentic AI module, return to the launcher using browser Back, then open GIS in the same browser session. Do not submit prompts or alter saved map data.
Acceptance criteria:
Selecting the Agentic AI launcher card opens its module view without an application error.
Browser Back returns to the V4 launcher with the GIS card visible.
Selecting GIS from that launcher opens the GIS map view with visible map controls and no application error.
Capture browser evidence and the observed URL at each decisive state.
