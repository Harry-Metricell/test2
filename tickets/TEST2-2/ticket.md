# TEST2-2: test

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-2

## Acceptance Criteria

1. Given a user is viewing Voice Call, MS Teams Call, Data Speed, Service, Video Streaming, Browsing, FTP, SMS or Email, when the report loads, then an Export action is available.
2. Given a user is viewing Overview, when the report loads, then an Export action is not available.
3. Given a user selects Export from a supported view, when the export completes, then an Excel file containing that view’s export data is downloaded.
4. Given a user changes the Beacon or date range, when they export a supported view, then the generated file reflects the current Beacon and selected range.
5. Given the file is downloaded, when its filename is generated, then it identifies the report type and export date.
6. Given export data is unavailable or the request fails, when the user attempts an export, then the standard error or empty response is shown without exposing data outside their existing access.

## Subtasks

No subtasks imported.

## Description

As a SmartTools user
I want to export the selected Beacon report view to Excel
So that I can analyse and share the report data outside SmartTools.
Issue/Change Description:
Provide an Export action for detailed Beacon report views. The export must use the currently selected Beacon, date range and report view, and produce the corresponding Excel extract.
In scope: Voice Call, MS Teams Call, Data Speed, Service, Video Streaming, Browsing, FTP, SMS and Email views. The downloaded filename should identify the report type and export date.
The Export action is not shown for Overview. Chart/PDF export and changes to the report data are out of scope.
QA: test each supported view, selected Beacon/date propagation, generated file type/name, unavailable data, error handling and user/tenant data access controls.
Acceptance Criteria:
Given a user is viewing Voice Call, MS Teams Call, Data Speed, Service, Video Streaming, Browsing, FTP, SMS or Email, when the report loads, then an Export action is available.
Given a user is viewing Overview, when the report loads, then an Export action is not available.
Given a user selects Export from a supported view, when the export completes, then an Excel file containing that view’s export data is downloaded.
Given a user changes the Beacon or date range, when they export a supported view, then the generated file reflects the current Beacon and selected range.
Given the file is downloaded, when its filename is generated, then it identifies the report type and export date.
Given export data is unavailable or the request fails, when the user attempts an export, then the standard error or empty response is shown without exposing data outside their existing access.
