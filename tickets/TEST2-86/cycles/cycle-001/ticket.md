# TEST2-86: Display Upload Point Details

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Blocked
- Workflow state: Blocked
- Action owner: Coordinator
- Next action: Manual review required after retry limit
- Jira: https://metricell.atlassian.net/browse/TEST2-86

## Acceptance Criteria

1. Given a completed Upload test is selected, its summary shows the available test and device information, including Upload Rate and Wi-Fi connection status.
2. Given Upload samples are available, a time-series chart shows Signal Strength in dBm and Upload Rate in Mbps over the test duration.
3. Given per-sample data is available, it is displayed in a sortable and filterable table with the relevant units.
4. Given average signal metrics are returned, Average Signal Strength, Average Signal Quality, and Average SNR appear immediately after Upload Rate.
5. Given the selected Upload point has no measurable duration, the user receives the standard no-data state rather than an empty detail view.
6. Given Upload details are loading, unavailable, or fail to load, a standard loading, no-data, or error state is shown without displaying incorrect data.

## Subtasks

No subtasks imported.

## Description

As a SmartTools map user
I want to view the details of an Upload point
So that I can investigate upload performance at the selected location.
Issue/Change Description:
When a user opens an Upload point through the shared point-detail dialog, show the test summary, a time-series chart, and the returned per-sample data.
The summary includes the reported technology, user, handset, service, serving cell, duration, tested technologies, indoor/outdoor status, Upload Rate, and Wi-Fi connection status. The chart shows signal strength and Upload Rate over the test duration. Where returned, display Average Signal Strength, Average Signal Quality, and Average SNR immediately after Upload Rate.
Acceptance Criteria:
Given a completed Upload test is selected, its summary shows the available test and device information, including Upload Rate and Wi-Fi connection status.
Given Upload samples are available, a time-series chart shows Signal Strength in dBm and Upload Rate in Mbps over the test duration.
Given per-sample data is available, it is displayed in a sortable and filterable table with the relevant units.
Given average signal metrics are returned, Average Signal Strength, Average Signal Quality, and Average SNR appear immediately after Upload Rate.
Given the selected Upload point has no measurable duration, the user receives the standard no-data state rather than an empty detail view.
Given Upload details are loading, unavailable, or fail to load, a standard loading, no-data, or error state is shown without displaying incorrect data.
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
