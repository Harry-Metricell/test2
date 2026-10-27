# TEST2-79: Map and inspect Automobile Download and Upload results

## Current State

- Jira status: To Do
- QA outcome: Blocked
- Workflow state: Blocked
- Action owner: Coordinator
- Next action: Waiting for Jira status: READY FOR TESTING
- Jira: https://metricell.atlassian.net/browse/TEST2-79

## Acceptance Criteria

1. Given neither layer has been selected, when the map is displayed, then Download and Upload test-result points are not shown.
2. Given the user selects Download or Upload and authorised data is available, when results load, then matching results are shown as selectable map points.
3. Given the user selects a Download or Upload point, when details load successfully, then the dialog shows the stated summary fields and the Signal Strength / applicable-rate chart.
4. Given the Download or Upload details table is shown, when rendered, then it contains its respective specified columns and displays applicable units and “No Error” as specified.
5. Given a user sorts or filters a supported detailed-table column, when the operation is applied, then the displayed rows reflect it.
6. Given a test has zero duration or its details cannot be loaded, when the user requests details, then no details dialog opens for the former and no stale or misleading data is shown for the latter.

## Subtasks

No subtasks imported.

## Description

As a SmartTools user
I want to select the Download or Upload layer and view its test results as points on a map, then open details for an individual result
So that I can assess data-transfer performance at the location where each test was performed.
Issue/Change Description:
Provide Download and Upload as selectable map layers. Results for each remain hidden until that layer is selected; when selected, load only matching authorised results as selectable points.
Selecting a point opens the corresponding details dialog. Show the summary fields Data Technology, MSISDN, Service, Serving Cell, Test Duration, Test Technologies, Download Rate or Upload Rate, and Wi-Fi Connected. Show a chart of Signal Strength (dBm) and the applicable rate (Mbps) over time.
Show a sortable and filterable detailed table. For Download, display MSISDN, Start Time, End Time, Download Rate, Band, Serving Cell, Service, Test Technologies, Data Technology, Wi-Fi Connected, URL and Error Message. For Upload, display the same fields with Upload Rate in place of Download Rate. Format signal strength and rate values with their units; a null error value displays as “No Error”.
Do not open details for a zero-duration test. Show loading and error states without stale or misleading data. Route Replay is out of scope.
Acceptance Criteria:
Given neither layer has been selected, when the map is displayed, then Download and Upload test-result points are not shown.
Given the user selects Download or Upload and authorised data is available, when results load, then matching results are shown as selectable map points.
Given the user selects a Download or Upload point, when details load successfully, then the dialog shows the stated summary fields and the Signal Strength / applicable-rate chart.
Given the Download or Upload details table is shown, when rendered, then it contains its respective specified columns and displays applicable units and “No Error” as specified.
Given a user sorts or filters a supported detailed-table column, when the operation is applied, then the displayed rows reflect it.
Given a test has zero duration or its details cannot be loaded, when the user requests details, then no details dialog opens for the former and no stale or misleading data is shown for the latter.
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
