# TEST2-90: Map and inspect Automobile call results

## Current State

- Jira status: TESTING IN PROGRESS
- QA outcome: Blocked
- Workflow state: Blocked
- Action owner: Human
- Next action: Awaiting controlled tester verification release; Jira: TESTING IN PROGRESS
- Jira: https://metricell.atlassian.net/browse/TEST2-90

## Acceptance Criteria

1. Given Automobile Call data is available, when the Call layer is selected, then results are displayed as selectable points on the map.
2. Given the Call layer is configured, then the shared Colour By selector offers CSR, Downlink MOS, Uplink MOS, and Estimated MOS, with CSR selected by default.
3. Given the user changes Colour By, then visible Call markers use the selected metric and the legend updates to its matching title, units, categories, and colours. CSR is a percentage; MOS values are dimensionless scores. Date, filters, group visibility, marker identities, and underlying result selection remain unchanged.
4. Given a Call marker represents multiple results, then CSR follows the legacy calculation: 100 × successful calls / (successful + setup-failed + operator-answered + no-service + invalid calls), with zero returned for a zero denominator; dropped calls are excluded from this denominator. Each MOS metric is separately weighted by its own valid sample count. Estimated MOS uses its dedicated legacy Estimated MOS values and counts and is not calculated by averaging Downlink and Uplink MOS.
5. Given default CSR colouring, then the legend uses green #31AA4F for 95–100%, light green #86BE42 for 90–<95%, yellow #FCBF1A for 85–<90%, red #E61733 for 80–<85%, and dark red #AE1A32 for 0–<80%. Exact boundaries use the higher band.
6. Given any default MOS colouring, then values use dark red #AE1A32 for 1–<2, yellow #FCBF1A for 2–<3, light green #86BE42 for 3–<4, and green #31AA4F for 4–5 inclusive. Exact internal boundaries use the higher band; exactly 5 is green, as confirmed by the developer.
7. Given the selected MOS metric has no valid samples, then it remains unavailable and is not substituted with zero, CSR, or a different MOS metric. Values outside the defined MOS bands use the legacy Out of Threshold category, initially white and hidden; no separate Not Tested category is introduced for Call.
8. Given users edit the selected metric's customisable legend bands, labels, marker size, or category visibility through the shared legend controls, then the matching Call markers update, and those settings remain specific to that metric and layer instance when switching Colour By. Fixed No Service and Out of Threshold category definitions remain immutable.
9. Given a Call layer or saved GIS view is restored, then its selected Colour By metric and associated legend settings are restored. Existing configurations without a Colour By selection default to CSR.
10. Given a user selects a row in the cluster results tab, then a separate Call detail tab opens for that exact PointID, retaining the cluster tab. Reopening or restoring Call and Service tabs retains the relevant time and filter scope.
11. Given an authorised user clicks a Call marker, when it contains one result, then its Call detail tab opens directly; when it contains multiple results, then a cluster results tab opens using the same GIS detail-tab workflow as HTTP and Download.
12. Given the Call cluster detail tab is displayed, then its results table contains MSISDN, Test Result, Start Time, End Time, Test Duration, Call Setup Time, Connection Time, Disconnection Cause Code, LTE Return Time, CSFB Time, MOS Downlink, MOS Uplink, Estimated MOS, Band, Test Technologies, Call End Service, and Call End Serving Cell.
13. Given the Call cluster results table is displayed, then users can sort by each of its available columns.
14. Given a user selects a result with related service information, when service details are available, then a separate Service Details tab opens for that result.
15. Given Call technology legends or filters are displayed, then they include 2G, 3G, 4G and 5G SA and exclude 5G NSA.
16. Given a selected Call result has no duration, when the user requests details, then a clear no-data message is displayed.
17. Given point or service details cannot be returned, when a user selects the relevant item, then no stale detail data is shown.
18. Given CSR is selected, then default generation marker shapes are 2G circle, 3G triangle, 4G diamond, and 5G SA pentagon. Generation 0 uses a black square labelled No Service; this category is fixed and is not a CSR percentage band. 5G NSA is absent.
19. Given a MOS metric is selected, then the default marker shape is square for Downlink MOS, circle for Uplink MOS, and hexagon for Estimated MOS. These MOS legends group by the selected metric rather than repeating the CSR generation groups.
20. Given a Colour By metric is selected, then it uses its own source field: CSR uses Data.CallCsr, Downlink MOS uses Data.ActualMoSDownlinkAvg, Uplink MOS uses Data.ActualMoSUplinkAvg, and Estimated MOS uses Data.EstimatedMOSAVG, as specified in the supplied legacy Call configuration.
21. Given any of the four Call legends is displayed, then it includes a fixed Out of Threshold category using a white square and hidden by default. The default band order is descending. CSR band limits are 0–100 and MOS band limits are 1–5; visible labels must agree with the implemented boundary rules.
22. Legacy references: Automobile_Call Colour By options and default legend bands in DatabaseBuilder SmartNetwork.Layers.table.sql; metric calculations in SmartNetwork.GetAutomobileCall.proc.sql. V4 reference: feature/automobile-VM2ST-116-legend. These criteria describe required behaviour; adding selector labels alone does not complete metric colouring.
23. Additional reference: developer-supplied legacy Call JSON confirms metric source fields, metric-specific shapes, fixed No Service and Out of Threshold categories, and descending default bands. Its filters also contain hidden Test Results choices (all enabled) and POLQA Voice Quality Tested (default off). Adding or exposing those filters in V4 requires a separate scope decision; this Colour By refinement does not approve additional filter work.
24. Boundary decision confirmed by the developer on 2026-10-09: MOS exactly 5 belongs to the green band, consistently with the shared VM2ST-116 legend classifier. Its label must show that the upper bound 5 is included.

## Subtasks

No subtasks imported.

## Description

As a SmartTools user
I want to view Automobile call-test results as points on a map, colour them by call success or voice quality, and inspect individual results in detail tabs
So that I can investigate call success and voice-quality behaviour at a location.
Issue/Change Description:
Provide the Automobile Call layer with selectable map points and a Colour By selector offering CSR, Downlink MOS, Uplink MOS, and Estimated MOS. CSR is the default. Selecting a marker follows the HTTP and Download GIS detail-tab workflow: a single result opens its Call detail tab directly; multiple results open a cluster results tab, and selecting a row opens that exact result in a separate Call detail tab. Existing group-based data visibility applies throughout.
The cluster detail tab must contain a sortable results table with: MSISDN, Test Result, Start Time, End Time, Test Duration, Call Setup Time, Connection Time, Disconnection Cause Code, LTE Return Time, CSFB Time, MOS Downlink, MOS Uplink, Estimated MOS, Band, Test Technologies, Call End Service, and Call End Serving Cell.
Where a selected result has related service information, the user can open the associated Service Details tab.
Call technology legends and filters must distinguish 2G, 3G, 4G and 5G SA. 5G NSA must not be presented as a call technology because it does not support call capability.
Dependencies: migrated Automobile Call map, point-detail and Service Details data must provide stable point identifiers, the listed fields, and separate CSR, Downlink MOS, Uplink MOS, and Estimated MOS values. Reuse the shared Colour By selector and legend presentation/editing from feature/automobile-VM2ST-116-legend; selecting a metric must use that metric's data rather than relabelling a single CSR value.
QA: verify all four Colour By modes, legacy metric calculations, colour boundaries, missing MOS data, metric-specific legend edits, restored Colour By selections, representative successful and failed calls across supported technologies, 5G NSA exclusion, sortable fields, detail-tab selection/restoration, service drill-down, and zero-duration results.
Acceptance Criteria:
Given Automobile Call data is available, when the Call layer is selected, then results are displayed as selectable points on the map.
Given the Call layer is configured, then the shared Colour By selector offers CSR, Downlink MOS, Uplink MOS, and Estimated MOS, with CSR selected by default.
Given the user changes Colour By, then visible Call markers use the selected metric and the legend updates to its matching title, units, categories, and colours. CSR is a percentage; MOS values are dimensionless scores. Date, filters, group visibility, marker identities, and underlying result selection remain unchanged.
Given a Call marker represents multiple results, then CSR follows the legacy calculation: 100 × successful calls / (successful + setup-failed + operator-answered + no-service + invalid calls), with zero returned for a zero denominator; dropped calls are excluded from this denominator. Each MOS metric is separately weighted by its own valid sample count. Estimated MOS uses its dedicated legacy Estimated MOS values and counts and is not calculated by averaging Downlink and Uplink MOS.
Given default CSR colouring, then the legend uses green #31AA4F for 95–100%, light green #86BE42 for 90–<95%, yellow #FCBF1A for 85–<90%, red #E61733 for 80–<85%, and dark red #AE1A32 for 0–<80%. Exact boundaries use the higher band.
Given any default MOS colouring, then values use dark red #AE1A32 for 1–<2, yellow #FCBF1A for 2–<3, light green #86BE42 for 3–<4, and green #31AA4F for 4–5 inclusive. Exact internal boundaries use the higher band; exactly 5 is green, as confirmed by the developer.
Given the selected MOS metric has no valid samples, then it remains unavailable and is not substituted with zero, CSR, or a different MOS metric. Values outside the defined MOS bands use the legacy Out of Threshold category, initially white and hidden; no separate Not Tested category is introduced for Call.
Given users edit the selected metric's customisable legend bands, labels, marker size, or category visibility through the shared legend controls, then the matching Call markers update, and those settings remain specific to that metric and layer instance when switching Colour By. Fixed No Service and Out of Threshold category definitions remain immutable.
Given a Call layer or saved GIS view is restored, then its selected Colour By metric and associated legend settings are restored. Existing configurations without a Colour By selection default to CSR.
Given a user selects a row in the cluster results tab, then a separate Call detail tab opens for that exact PointID, retaining the cluster tab. Reopening or restoring Call and Service tabs retains the relevant time and filter scope.
Given an authorised user clicks a Call marker, when it contains one result, then its Call detail tab opens directly; when it contains multiple results, then a cluster results tab opens using the same GIS detail-tab workflow as HTTP and Download.
Given the Call cluster detail tab is displayed, then its results table contains MSISDN, Test Result, Start Time, End Time, Test Duration, Call Setup Time, Connection Time, Disconnection Cause Code, LTE Return Time, CSFB Time, MOS Downlink, MOS Uplink, Estimated MOS, Band, Test Technologies, Call End Service, and Call End Serving Cell.
Given the Call cluster results table is displayed, then users can sort by each of its available columns.
Given a user selects a result with related service information, when service details are available, then a separate Service Details tab opens for that result.
Given Call technology legends or filters are displayed, then they include 2G, 3G, 4G and 5G SA and exclude 5G NSA.
Given a selected Call result has no duration, when the user requests details, then a clear no-data message is displayed.
Given point or service details cannot be returned, when a user selects the relevant item, then no stale detail data is shown.
Given CSR is selected, then default generation marker shapes are 2G circle, 3G triangle, 4G diamond, and 5G SA pentagon. Generation 0 uses a black square labelled No Service; this category is fixed and is not a CSR percentage band. 5G NSA is absent.
Given a MOS metric is selected, then the default marker shape is square for Downlink MOS, circle for Uplink MOS, and hexagon for Estimated MOS. These MOS legends group by the selected metric rather than repeating the CSR generation groups.
Given a Colour By metric is selected, then it uses its own source field: CSR uses Data.CallCsr, Downlink MOS uses Data.ActualMoSDownlinkAvg, Uplink MOS uses Data.ActualMoSUplinkAvg, and Estimated MOS uses Data.EstimatedMOSAVG, as specified in the supplied legacy Call configuration.
Given any of the four Call legends is displayed, then it includes a fixed Out of Threshold category using a white square and hidden by default. The default band order is descending. CSR band limits are 0–100 and MOS band limits are 1–5; visible labels must agree with the implemented boundary rules.
Legacy references: Automobile_Call Colour By options and default legend bands in DatabaseBuilder SmartNetwork.Layers.table.sql; metric calculations in SmartNetwork.GetAutomobileCall.proc.sql. V4 reference: feature/automobile-VM2ST-116-legend. These criteria describe required behaviour; adding selector labels alone does not complete metric colouring.
Additional reference: developer-supplied legacy Call JSON confirms metric source fields, metric-specific shapes, fixed No Service and Out of Threshold categories, and descending default bands. Its filters also contain hidden Test Results choices (all enabled) and POLQA Voice Quality Tested (default off). Adding or exposing those filters in V4 requires a separate scope decision; this Colour By refinement does not approve additional filter work.
Boundary decision confirmed by the developer on 2026-10-09: MOS exactly 5 belongs to the green band, consistently with the shared VM2ST-116 legend classifier. Its label must show that the upper bound 5 is included.
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
