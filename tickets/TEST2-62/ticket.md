# TEST2-62: Navigate from the V4 launcher through GIS and API Request Audit and back

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create final evidence review handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-62

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Exercise a complete cross-module user journey using real modules, without relying on placeholder features or saved-state persistence.
Environment: https://o2intelligence-v4-dev.metricell.com/launcher. Use existing authorised access. This test is navigation-only: do not add layers, edit records, alter audit filters or perform administrative actions.
Acceptance criteria
From the authorised launcher, opening GIS displays a settled GIS map with visible map controls at the GIS destination, not a login or application error page.
Using browser Back after GIS loads returns to the launcher and displays its module cards, including API Request Audit.
From that returned launcher, opening API Request Audit displays identifiable audit content such as request metrics or its Requests and errors over time chart at the audit destination, not a login or application error page.
Using browser Back after API Request Audit loads returns to the launcher again, with both GIS and API Request Audit cards available.
Record browser-derived URLs at each asserted destination and direct before/after screenshots for every navigation. Each criterion must perform its own relevant journey if tested independently; do not reuse another criterion's evidence. Do not assert stable metric values, state persistence across modules, or absence of server-side activity. Leave the browser on the launcher.
