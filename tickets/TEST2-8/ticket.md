# TEST2-8: Preserve map context when switching GIS panels

## Current State

- Jira status: Rejected
- QA outcome: Unverified
- Workflow state: Rejected
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-8

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

When a user opens the GIS workspace and moves between the layer panel and map tools, the current map context is retained. A selected coverage layer remains visible after the panel is closed, the zoom position is retained while another map tool is used, and returning to the default view restores the expected starting area without hiding the map controls.
