# TEST2-87: Display Call Point Details

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Blocked
- Workflow state: Blocked
- Action owner: Coordinator
- Next action: Manual review required; final evidence report published
- Jira: https://metricell.atlassian.net/browse/TEST2-87

## Acceptance Criteria

1. Given a completed Call test is selected, its summary displays the available duration, result, connection time, handset, and disconnection information.
2. Given Call samples are available, a timeline chart displays call state, service technology, and signal strength over the test duration.
3. Given Call samples are available, they are displayed in a sortable and filterable table.
4. Given a sample has a known serving site/cell, the table displays it as Serving Cell; otherwise, it displays the CGI.
5. Given the user selects a Call sample, the related Service details open for that point in time.
6. Given the selected Call point has no measurable duration, the user receives the standard no-data state rather than an empty detail view.
7. Given Call details are loading, unavailable, or fail to load, a standard loading, no-data, or error state is shown without displaying incorrect data.

## Subtasks

No subtasks imported.

## Description

As a SmartTools map user
I want to view the details of a Call point
So that I can investigate call performance and serving-cell information at the selected location.
Issue/Change Description:
When a user opens a Call point through the shared point-detail dialog, show the call summary, a call timeline chart, and the returned call samples.
The summary includes the available duration, test result, connection time, start and end time, handset, and disconnection cause. The timeline shows call state, service technology, and signal strength. The sample data includes a Serving Cell column; where a known site/cell is not available, show the CGI instead.
Selecting a call sample opens the relevant Service details for that point in time.
Acceptance Criteria:
Given a completed Call test is selected, its summary displays the available duration, result, connection time, handset, and disconnection information.
Given Call samples are available, a timeline chart displays call state, service technology, and signal strength over the test duration.
Given Call samples are available, they are displayed in a sortable and filterable table.
Given a sample has a known serving site/cell, the table displays it as Serving Cell; otherwise, it displays the CGI.
Given the user selects a Call sample, the related Service details open for that point in time.
Given the selected Call point has no measurable duration, the user receives the standard no-data state rather than an empty detail view.
Given Call details are loading, unavailable, or fail to load, a standard loading, no-data, or error state is shown without displaying incorrect data.
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
