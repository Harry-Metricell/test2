# TEST2-89: Map and inspect MS Teams Call results

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-89

## Acceptance Criteria

1. Given MS Teams Call has not been selected, when the map is displayed, then no MS Teams Call test-result points are shown.
2. Given the user selects the MS Teams Call layer and authorised data is available, when the results load, then matching results are shown as selectable map points.
3. Given an MS Teams Call point is shown, when its Poor Quality value is 0–0.99, 1–9.99, 10–24.99 or 25+, then its map colour is Green, Yellow, Amber or Red respectively.
4. Given the user selects an MS Teams Call point, when the details load successfully, then a dialog shows the stated summary fields, signal and download charts with available handover markers, and detailed samples excluding the stated fields.
5. Given detailed samples are shown, when the user sorts or filters a supported column, then the displayed samples reflect that operation.
6. Given the user exports the selected test, when the export completes, then its CSV contains data for that test.
7. Given a result has zero duration or details cannot be loaded, when the dialog is requested, then no stale or misleading details are displayed.

## Subtasks

No subtasks imported.

## Description

As a SmartTools user
I want to select the MS Teams Call layer and view its test results as points on a map, then open a detail dialog for an individual result
So that I can assess MS Teams call quality at the location where each test was performed.
Issue/Change Description:
Provide MS Teams Call as a selectable map layer. MS Teams Call results must remain hidden until the layer is selected; when selected, load only matching authorised results as selectable points.
Use these Poor Quality thresholds: 0–0.99 Green; 1–9.99 Yellow; 10–24.99 Amber; 25+ Red. Selecting a point opens an MS Teams Call details dialog. It shows the summary fields Test ID, Test Result, Connection Time, Call Duration, Poor Quality, MSISDN and Test Technologies; signal and download charts with available handover markers; and a sortable, filterable detailed-sample table. Exclude label, latitude, longitude and handover-only columns from that table. Allow CSV export for the selected test.
Route Replay and advanced MS Teams display settings, including detailed routes and linked site/cell display, are out of scope. A zero-duration result or failed detail load must not show stale or misleading data.
Acceptance Criteria:
Given MS Teams Call has not been selected, when the map is displayed, then no MS Teams Call test-result points are shown.
Given the user selects the MS Teams Call layer and authorised data is available, when the results load, then matching results are shown as selectable map points.
Given an MS Teams Call point is shown, when its Poor Quality value is 0–0.99, 1–9.99, 10–24.99 or 25+, then its map colour is Green, Yellow, Amber or Red respectively.
Given the user selects an MS Teams Call point, when the details load successfully, then a dialog shows the stated summary fields, signal and download charts with available handover markers, and detailed samples excluding the stated fields.
Given detailed samples are shown, when the user sorts or filters a supported column, then the displayed samples reflect that operation.
Given the user exports the selected test, when the export completes, then its CSV contains data for that test.
Given a result has zero duration or details cannot be loaded, when the dialog is requested, then no stale or misleading details are displayed.
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
