# TEST2-91: Filter Automobile map results

## Current State

- Jira status: TESTING IN PROGRESS
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create criteria conversion handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-91

## Acceptance Criteria

1. Given an Automobile filter is edited, when SIM MCC, SIM MNC, MCC, MNC or LAC is entered, then the field accepts numeric digits only; MSISDN, CI, Site and Cell remain text inputs.
2. Given a standard Automobile map layer is active, when filters are opened, then time, handset, technology/frequency, network and available device-group filters are available.
3. Given the user applies one or more filters, when results reload, then only authorised results matching the active criteria are shown.
4. Given configured frequencies or device groups are available, when filters are displayed, then they are offered without being hard-coded.
5. Given a restricted device-segregation option exists, when device groups are displayed, then it is unavailable.
6. Given Route Replay is active, when filters are viewed, then this story’s standard-map filter controls do not apply.

## Subtasks

No subtasks imported.

## Description

As a SmartTools user
I want to filter Automobile map results before viewing them
So that I can focus analysis on the tests, network conditions and devices relevant to my investigation.
Issue/Change Description:
Provide shared filters for standard Automobile map layers. Support a rolling 90-day time range; handset filters for MSISDN, SIM MNC and SIM MCC; technology filters for no-Service, 2G, 3G, 4G, 5G NSA and 5G SA; configuration-supplied frequencies; network filters for MCC, MNC, LAC, CI, Site and Cell; and configuration-supplied device groups.
Restricted device-segregation options are not available. Applying filters displays only matching authorised map results. Device groups and frequencies remain configuration-driven. Route Replay is out of scope.
Acceptance Criteria:
Given an Automobile filter is edited, when SIM MCC, SIM MNC, MCC, MNC or LAC is entered, then the field accepts numeric digits only; MSISDN, CI, Site and Cell remain text inputs.
Given a standard Automobile map layer is active, when filters are opened, then time, handset, technology/frequency, network and available device-group filters are available.
Given the user applies one or more filters, when results reload, then only authorised results matching the active criteria are shown.
Given configured frequencies or device groups are available, when filters are displayed, then they are offered without being hard-coded.
Given a restricted device-segregation option exists, when device groups are displayed, then it is unavailable.
Given Route Replay is active, when filters are viewed, then this story’s standard-map filter controls do not apply.
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
