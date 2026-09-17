# TEST2-21: real ticket

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Unverified
- Workflow state: Ready
- Action owner: Coordinator
- Next action: QA review complete
- Jira: https://metricell.atlassian.net/browse/TEST2-21

## Acceptance Criteria

1. Given the Beacon view loads, when filter options are retrieved, then the available Beacon groups and profiles are shown without duplicate option labels.
2. Given a user selects a group, when the filter is applied, then the map shows only Beacons assigned to that group.
3. Given a user selects a profile, when the filter is applied, then the map shows only Beacons assigned to that profile.
4. Given a user selects both a group and a profile, when the filters are applied, then the map shows only Beacons that match both selections.
5. Given the selected filters return no matching Beacons, when the view refreshes, then no map markers are shown while the map and filters remain usable.
6. Given a user changes either filter, when the refreshed results are displayed, then previous map results are not retained.

## Subtasks

No subtasks imported.

## Description

As a SmartTools user
I want to filter Beacons by assigned group and profile
So that I can focus the map on the devices relevant to my investigation
Issue/Change Description:
Provide group and profile filter controls using the available Beacon groups and profiles returned by the Beacon data service. A selected group or profile filters the map. When both are selected, only Beacons matching both selections are displayed.
This story covers group/profile filtering for the map. Side-panel Beacon list filtering and synchronisation are owned by VM2ST-71.
Status filtering, search/sort, favourites, geofencing, and report functionality are out of scope.
Acceptance Criteria:
Given the Beacon view loads, when filter options are retrieved, then the available Beacon groups and profiles are shown without duplicate option labels.
Given a user selects a group, when the filter is applied, then the map shows only Beacons assigned to that group.
Given a user selects a profile, when the filter is applied, then the map shows only Beacons assigned to that profile.
Given a user selects both a group and a profile, when the filters are applied, then the map shows only Beacons that match both selections.
Given the selected filters return no matching Beacons, when the view refreshes, then no map markers are shown while the map and filters remain usable.
Given a user changes either filter, when the refreshed results are displayed, then previous map results are not retained.
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
