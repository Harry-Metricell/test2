# TEST2-81: Map HTTP Browsing, Ping and Video Streaming point details

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Blocked
- Workflow state: Blocked
- Action owner: Human
- Next action: Awaiting controlled tester verification release; Jira: READY FOR TESTING
- Jira: https://metricell.atlassian.net/browse/TEST2-81

## Acceptance Criteria

1. Given HTTP Browsing, Ping, or Video Streaming data is available, when its layer is selected, then its results are displayed as points on the map.
2. Given a user clicks a result point, when point details are available, then a new dialog opens for that exact point.
3. Given an HTTP Browsing point is selected, then the dialog displays Page Load Time with the common point context.
4. Given a Ping point is selected, then the dialog displays Ping Time with the common point context.
5. Given a Video Streaming point is selected, then the dialog displays Rebuffer Count with the common point context.
6. Given an HTTP Browsing test ends in error, when its point is rendered, then it is visually distinct from a successful result and is not coloured as a successful Page Load Time result.
7. Given point details cannot be returned, when a user selects a point, then the user receives a clear no-data or error message and no stale detail data is displayed.

## Subtasks

No subtasks imported.

## Description

As a SmartTools user
I want to view HTTP Browsing, Ping and Video Streaming test results as points on a map and open a detail dialog for an individual point
So that I can investigate the specific test result at a location.
Issue/Change Description:
Provide direct-map layers for HTTP Browsing, Ping and Video Streaming. Each result is displayed as a selectable map point.
Selecting a point opens a new point-detail dialog for that exact result. The dialog must show the test type, result time, location, available network technology/context, and the test-specific KPI:
HTTP Browsing: Page Load Time
Ping: Ping Time
Video Streaming: Rebuffer Count
HTTP Browsing results that end in error must be visually distinct from successful Page Load Time results; a failed result with a zero Page Load Time must not be coloured as successful.
Route Replay is out of scope; it will be covered by a separate story.
Dependencies: migrated Automobile map and point-detail data must provide a stable point identifier and the fields required by the dialog.
QA: verify each test type with representative data, point-to-dialog data matching, failed HTTP result colouring, and empty/error detail responses.
Acceptance Criteria:
Given HTTP Browsing, Ping, or Video Streaming data is available, when its layer is selected, then its results are displayed as points on the map.
Given a user clicks a result point, when point details are available, then a new dialog opens for that exact point.
Given an HTTP Browsing point is selected, then the dialog displays Page Load Time with the common point context.
Given a Ping point is selected, then the dialog displays Ping Time with the common point context.
Given a Video Streaming point is selected, then the dialog displays Rebuffer Count with the common point context.
Given an HTTP Browsing test ends in error, when its point is rendered, then it is visually distinct from a successful result and is not coloured as a successful Page Load Time result.
Given point details cannot be returned, when a user selects a point, then the user receives a clear no-data or error message and no stale detail data is displayed.
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
