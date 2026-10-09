# TEST2-67: Open API Request Audit from V4 launcher and return to GIS

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: QA review complete
- Jira: https://metricell.atlassian.net/browse/TEST2-67

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Purpose
Verify navigation between real V4 modules without modifying application data.
Setup and scope
Start at https://o2intelligence-v4-dev.metricell.com/launcher using authorised test access. Navigation only: do not edit records, change audit filters, add layers or change saved settings.
Acceptance criteria
The authorised launcher displays GIS and API Request Audit cards with their Open module controls.
Opening API Request Audit displays identifiable audit content (request metrics or the Requests and errors over time chart), not a sign-in or application error page. Do not require specific metric values.
Browser Back returns to the launcher with GIS available.
Opening GIS from the returned launcher displays the settled map and map controls, not a sign-in or application error page.
Evidence and cleanup
Capture each navigation's actual before/after state with browser-derived URL records. Finish on the launcher. Do not infer module success from URL alone.
Documentation relevance
Check existing navigation instructions; amend only a genuine missing or inaccurate step, avoiding duplicate sections.
