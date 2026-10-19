# TEST2-80: Map and inspect Automobile Service results

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Blocked
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create final evidence review handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-80

## Acceptance Criteria

1. Given the Service layer has not been selected, when the map is displayed, then no Service test-result points are shown.
2. Given the user selects the Service layer and authorised data is available, when results load, then matching results are shown as selectable map points.
3. Given the user selects a Service point, when its details load successfully, then a dialog displays MSISDN, Test Time, Signal, Band, Service, Data Technology, PLMN and Serving Cell.
4. Given the Service details table is displayed, when the user sorts or filters a supported column, then the displayed rows reflect that operation.
5. Given cell-neighbour data is returned, when the dialog is displayed, then each neighbour is shown in a separate labelled details table.
6. Given details are loading or cannot be loaded, when the dialog is opened, then a loading or error state is shown without stale data.

## Subtasks

No subtasks imported.

## Description

As a SmartTools user
I want to select the Service layer and view Service test results as points on a map, then open details for an individual result
So that I can investigate service state and associated cell information at the location of a test.
Issue/Change Description:
Provide Service as a selectable map layer. Service results remain hidden until the layer is selected; when selected, load only matching authorised results as selectable points.
Selecting a point opens a Service details dialog. Display a sortable and filterable table containing: MSISDN, Test Time, Signal, Band, Service, Data Technology, PLMN and Serving Cell. When cell-neighbour data is returned, show each neighbour in its own labelled details table.
Show a loading state while details load and an error state if they cannot be retrieved; do not show stale or misleading data. Route Replay is out of scope.
Acceptance Criteria:
Given the Service layer has not been selected, when the map is displayed, then no Service test-result points are shown.
Given the user selects the Service layer and authorised data is available, when results load, then matching results are shown as selectable map points.
Given the user selects a Service point, when its details load successfully, then a dialog displays MSISDN, Test Time, Signal, Band, Service, Data Technology, PLMN and Serving Cell.
Given the Service details table is displayed, when the user sorts or filters a supported column, then the displayed rows reflect that operation.
Given cell-neighbour data is returned, when the dialog is displayed, then each neighbour is shown in a separate labelled details table.
Given details are loading or cannot be loaded, when the dialog is opened, then a loading or error state is shown without stale data.
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
