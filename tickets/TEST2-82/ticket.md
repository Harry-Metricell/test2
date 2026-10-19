# TEST2-82: Display Ping Point Details

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-82

## Acceptance Criteria

1. Given a Ping point is selected and its details load, Ping Time is shown in milliseconds for that selected point.
2. Given Ping attributes are available, they are displayed alongside Ping Time in the standard point-detail presentation.
3. Given 5G NSA is the only selected technology, when the user opens a Ping point, the point details open without error and show the selected point’s data.
4. Given Ping details are loading, unavailable, or fail to load, a standard loading, no-data, or error state is shown without displaying incorrect data.

## Subtasks

No subtasks imported.

## Description

As a SmartTools map user
I want to view the details for a Ping point
So that I can investigate latency at the selected location.
Issue/Change Description:
When a user opens a Ping point through the shared point-detail dialog, display Ping Time in milliseconds and the attributes returned for that selected point.
The Ping detail view must work when 5G NSA is the only selected technology. Point selection, dialog behaviour, and the mini-map are covered by the preceding shared stories.
Acceptance Criteria:
Given a Ping point is selected and its details load, Ping Time is shown in milliseconds for that selected point.
Given Ping attributes are available, they are displayed alongside Ping Time in the standard point-detail presentation.
Given 5G NSA is the only selected technology, when the user opens a Ping point, the point details open without error and show the selected point’s data.
Given Ping details are loading, unavailable, or fail to load, a standard loading, no-data, or error state is shown without displaying incorrect data.
Object Change List:
Merge Requests
Docusaurus Requests
Merge to Master:
Application Merge Requests
Merge to test:
Merge to main:
Project Upgrader Merge Requests
Feature folder merge:
Version folder Merge:
Database Merge Requests
Merge to staging:
Merge to main:
