# TEST2-83: Display Service Point Details

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Human
- Next action: Awaiting controlled tester verification release; Jira: READY FOR TESTING
- Jira: https://metricell.atlassian.net/browse/TEST2-83

## Acceptance Criteria

1. Given a Service point is selected and its details load, the returned serving-cell information is displayed.
2. Given neighbour-cell data is returned, each neighbour is displayed as a distinct neighbour section beneath the serving-cell details.
3. Given no neighbour-cell data is returned, the serving-cell details are displayed without an empty neighbour section.
4. Given Service detail values are available, the user can sort and filter the displayed detail rows.
5. Given a Service point is from 2G, 3G, 4G, 5G NSA, or 5G SA, KPI labels are appropriate to the reported generation.
6. Given 5G SA is the selected technology, when the user opens a Service point, its details load without error.
7. Given Service details are loading, unavailable, or fail to load, a standard loading, no-data, or error state is shown without displaying incorrect data.

## Subtasks

No subtasks imported.

## Description

As a SmartTools map user
I want to view serving-cell and neighbour details for a Service point
So that I can investigate the network serving the selected location.
Issue/Change Description:
When a user opens a Service point through the shared point-detail dialog, display the returned serving-cell information in the standard detail presentation. Where neighbour-cell data is available, display each neighbour separately beneath the serving-cell information.
The displayed KPI names must be appropriate to the reported radio generation. The detail view must also support Service points when 5G SA is selected. Point selection, dialog behaviour, and the mini-map are covered by the preceding shared stories.
Acceptance Criteria:
Given a Service point is selected and its details load, the returned serving-cell information is displayed.
Given neighbour-cell data is returned, each neighbour is displayed as a distinct neighbour section beneath the serving-cell details.
Given no neighbour-cell data is returned, the serving-cell details are displayed without an empty neighbour section.
Given Service detail values are available, the user can sort and filter the displayed detail rows.
Given a Service point is from 2G, 3G, 4G, 5G NSA, or 5G SA, KPI labels are appropriate to the reported generation.
Given 5G SA is the selected technology, when the user opens a Service point, its details load without error.
Given Service details are loading, unavailable, or fail to load, a standard loading, no-data, or error state is shown without displaying incorrect data.
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
