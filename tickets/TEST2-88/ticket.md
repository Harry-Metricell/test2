# TEST2-88: Configure MS Teams Call map display settings

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create user-guide impact assessment handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-88

## Acceptance Criteria

1. Given the MS Teams Call layer is active, when the user opens display settings, then configured map-colouring options and controls for detailed routes, linked sites and linked cells are available.
2. Given the user selects a configured colouring option, when the map updates, then MS Teams Call points and the legend use that configured colouring without hard-coded categories.
3. Given the user enables or disables detailed routes, when the map refreshes, then detailed route geometry is respectively shown or hidden for the active MS Teams Call results.
4. Given the map is below the configured zoom level for linked sites, when display settings are shown, then the linked-site control is unavailable and explains that the user must zoom in.
5. Given linked sites are enabled at a supported zoom level, when the user enables or disables linked cells, then linked-cell overlays are respectively shown or hidden; linked cells remain unavailable until linked sites are enabled.
6. Given the user changes any of these display settings, when other layers, Route Replay, standard map filters or legend point-filtering state are considered, then they are unchanged.

## Subtasks

No subtasks imported.

## Description

As a SmartTools user
I want to configure how MS Teams Call results and their network context are displayed on the map
So that I can investigate result patterns alongside the relevant route, sites and cells.
Issue/Change Description:
Provide display settings when the MS Teams Call map layer is active. The user can choose the configured map colouring, show or hide detailed routes, show or hide linked sites, and show or hide linked cells.
Colouring options and their legend sections must remain configuration-driven. Linked-site controls are enabled only at the configured map zoom level; linked-cell controls are enabled only when linked sites are shown and the zoom level supports them.
These settings affect only the active MS Teams Call layer. They do not alter the underlying result data, the standard map filters, or legend point filtering. Route Replay display options, including sectors and site labels, are out of scope.
Acceptance Criteria:
Given the MS Teams Call layer is active, when the user opens display settings, then configured map-colouring options and controls for detailed routes, linked sites and linked cells are available.
Given the user selects a configured colouring option, when the map updates, then MS Teams Call points and the legend use that configured colouring without hard-coded categories.
Given the user enables or disables detailed routes, when the map refreshes, then detailed route geometry is respectively shown or hidden for the active MS Teams Call results.
Given the map is below the configured zoom level for linked sites, when display settings are shown, then the linked-site control is unavailable and explains that the user must zoom in.
Given linked sites are enabled at a supported zoom level, when the user enables or disables linked cells, then linked-cell overlays are respectively shown or hidden; linked cells remain unavailable until linked sites are enabled.
Given the user changes any of these display settings, when other layers, Route Replay, standard map filters or legend point-filtering state are considered, then they are unchanged.
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
