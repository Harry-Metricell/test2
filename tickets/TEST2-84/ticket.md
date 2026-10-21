# TEST2-84: View Building Details and Floorplans

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create testing handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-84

## Acceptance Criteria

1. Given a single Building point is selected, when its details load, a separate dashboard opens for that building.
2. Given multiple Building points are selected at one map location, the user can choose which building dashboard to open.
3. Given the selection contains too many Building points, the user is asked to zoom in or use available filters rather than opening an ambiguous dashboard.
4. Given Building information is available, the dashboard displays building and floorplan summary data in sortable and filterable tables.
5. Given the building has floorplans, the dashboard displays their images and allows the user to select a floorplan.
6. Given a floorplan is selected, its image displays with its associated survey points overlaid.
7. Given the building has no floorplans, the dashboard still displays available building details without an empty floorplan image area.
8. Given Building data is loading, unavailable, or fails to load, a standard loading, no-data, or error state is shown without displaying incorrect data.

## Subtasks

No subtasks imported.

## Description

As a SmartTools map user
I want to open a building dashboard with its details and floorplans
So that I can investigate indoor survey results for a selected building.
Issue/Change Description:
When the user selects a Building point, open a separate building dashboard for that building. The dashboard shows building and floorplan summary information and, where available, floorplan images with the associated survey points overlaid.
When more than one Building point is selected at the same map location, allow the user to choose the building to open. If the selection contains too many Building points, prompt the user to zoom in or apply filters instead.
This story covers viewing the building dashboard and floorplans. Customising legend thresholds and exporting Building data are out of scope.
Acceptance Criteria:
Given a single Building point is selected, when its details load, a separate dashboard opens for that building.
Given multiple Building points are selected at one map location, the user can choose which building dashboard to open.
Given the selection contains too many Building points, the user is asked to zoom in or use available filters rather than opening an ambiguous dashboard.
Given Building information is available, the dashboard displays building and floorplan summary data in sortable and filterable tables.
Given the building has floorplans, the dashboard displays their images and allows the user to select a floorplan.
Given a floorplan is selected, its image displays with its associated survey points overlaid.
Given the building has no floorplans, the dashboard still displays available building details without an empty floorplan image area.
Given Building data is loading, unavailable, or fails to load, a standard loading, no-data, or error state is shown without displaying incorrect data.
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
