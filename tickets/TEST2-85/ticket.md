# TEST2-85: Display Download Point Details

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create testing handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-85

## Acceptance Criteria

1. Given a completed Download test is selected, its summary shows the available test and device information, including Download Rate and Wi-Fi connection status.
2. Given Download samples are available, a time-series chart shows Signal Strength in dBm and Download Rate in Mbps over the test duration.
3. Given per-sample data is available, it is displayed in a sortable and filterable table with the relevant units.
4. Given average signal metrics are returned, Average Signal Strength, Average Signal Quality, and Average SNR appear immediately after Download Rate.
5. Given the selected Download point has no measurable duration, the user receives the standard no-data state rather than an empty detail view.
6. Given Download details are loading, unavailable, or fail to load, a standard loading, no-data, or error state is shown without displaying incorrect data.

## Subtasks

No subtasks imported.

## Description

As a SmartTools map user
I want to view the details of a Download point
So that I can investigate download performance at the selected location.
Issue/Change Description:
When a user opens a Download point through the shared point-detail dialog, show the test summary, a time-series chart, and the returned per-sample data.
The test summary includes the reported technology, user, handset, service, serving cell, duration, tested technologies, indoor/outdoor status, Download Rate, and Wi-Fi connection status. The chart shows signal strength and Download Rate over the test duration. Where returned, display Average Signal Strength, Average Signal Quality, and Average SNR immediately after Download Rate.
Point selection, dialog behaviour, and the mini-map are covered by the preceding shared stories.
Acceptance Criteria:
Given a completed Download test is selected, its summary shows the available test and device information, including Download Rate and Wi-Fi connection status.
Given Download samples are available, a time-series chart shows Signal Strength in dBm and Download Rate in Mbps over the test duration.
Given per-sample data is available, it is displayed in a sortable and filterable table with the relevant units.
Given average signal metrics are returned, Average Signal Strength, Average Signal Quality, and Average SNR appear immediately after Download Rate.
Given the selected Download point has no measurable duration, the user receives the standard no-data state rather than an empty detail view.
Given Download details are loading, unavailable, or fail to load, a standard loading, no-data, or error state is shown without displaying incorrect data.
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
