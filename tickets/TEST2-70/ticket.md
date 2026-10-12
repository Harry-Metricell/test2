# TEST2-70: V4 launcher navigation: open API Request Audit and return to GIS

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create user-guide impact assessment handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-70

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

User story
As a V4 user, I want to move between the launcher, API Request Audit and GIS without losing access to the available modules.
Scope and setup
Start at https://o2intelligence-v4-dev.metricell.com/launcher using authorised V4 access. Use only normal UI controls. Navigation only: do not edit records, change audit filters or add layers. Record actual browser-derived destination URLs; metric values may vary.
Acceptance criteria
The authorised launcher visibly provides GIS and API Request Audit module cards and their Open controls.
Opening API Request Audit displays identifiable audit content, such as request metrics or the Requests and errors over time chart, rather than a sign-in or application error page.
Browser Back returns to the launcher with GIS available. Opening GIS from that returned launcher displays a settled map with map controls.
Evidence and cleanup
Capture the relevant before/after state for each journey, including the returned launcher immediately before opening GIS. Finish on the launcher without changing pre-existing application data.
User-guide relevance
Assess existing module-navigation guidance. Update it only if the verified workflow reveals a material gap; do not add a duplicate section just because this test passed.
