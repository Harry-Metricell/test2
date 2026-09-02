# Criteria Review: TEST2-2

Schema: v4-qa-criteria-review.v1
Ticket: TEST2-2
Jira: https://metricell.atlassian.net/browse/TEST2-2
Source files:
- tickets/TEST2-2/ticket.json
- tickets/TEST2-2/ticket.md
- tickets/TEST2-2/criteria.md
- status/generated/TEST2-2.json

## Review Summary

The ticket describes an Excel export action for detailed SmartTools Beacon report views. The export must use the currently selected Beacon, date range, and report view, and produce the corresponding Excel extract. Overview is explicitly excluded, as are chart/PDF export and changes to report data.

## Conservative Acceptance Criteria

1. Given a SmartTools user is viewing one of the supported detailed Beacon report views, when the report loads, then an Export action is available.
2. Supported detailed Beacon report views are Voice Call, MS Teams Call, Data Speed, Service, Video Streaming, Browsing, FTP, SMS, and Email.
3. Given a SmartTools user is viewing the Overview report view, when the report loads, then the Export action is not available.
4. Given a SmartTools user selects Export from a supported detailed Beacon report view, when the export completes successfully, then an Excel file is downloaded.
5. Given an Excel export file is downloaded, when its contents are inspected, then the file contains export data corresponding to the report view that was exported.
6. Given the selected Beacon or date range is changed, when a supported detailed Beacon report view is exported, then the generated Excel file reflects the current Beacon and selected date range.
7. Given the downloaded filename is generated, when the export completes, then the filename identifies the report type and export date.
8. Given export data is unavailable, when the user attempts an export, then the application shows the standard empty or unavailable-data response without exposing data outside the user's existing access.
9. Given an export request fails, when the failure is returned to the user, then the application shows the standard error response without exposing data outside the user's existing access.
10. Given tenant or user access restrictions apply, when a supported report view is exported, then the export only includes data the current user is already permitted to access.

## Out Of Scope

- Overview export support is out of scope.
- Chart export is out of scope.
- PDF export is out of scope.
- Changes to report data are out of scope.

## Warnings

- WARNING: The imported ticket status is `READY FOR TESTING`, but this review does not claim Jira acceptance, QA completion, or product pass.
- WARNING: The ticket does not define the exact Excel schema, workbook naming convention, standard empty response, or standard error response. QA should verify these against current product behavior or a separately approved specification.
- WARNING: The phrase `corresponding Excel extract` is interpreted conservatively as data for the selected report view, Beacon, and date range only; it does not imply new data calculations or report-data changes.

## QA Notes

- QA outcome remains `Not Tested` in the generated status data.
- Automation suitability remains `Unclassified` until selectors, seeded data, expected file format, and access-control test data are confirmed.
- Evidence should include the visible Export action state per view, downloaded Excel files for representative supported views, filename checks, selected Beacon/date propagation checks, unavailable-data/error behavior, and tenant/user access-control checks.

## No Jira Mutation

No Jira fields were changed. This file is a repository criteria review only.
