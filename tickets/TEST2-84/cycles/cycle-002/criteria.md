<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->
<!-- Verified testing context (2026-10-21): Surveyor > Active layer: Building. Building is a nested Surveyor choice, not a standalone catalogue entry. Source VM2ST-106 links VM2ST-115 and VM2ST-118, both Surveyor stories. Source references: https://metricell.atlassian.net/browse/VM2ST-106 https://metricell.atlassian.net/browse/VM2ST-115 https://metricell.atlassian.net/browse/VM2ST-118 . Setup/provenance only; acceptance criteria below are unchanged. -->

- [ ] Selecting one Building point opens a separate dashboard for that building once its details load.
- [ ] When multiple Building points are selected at one map location, the user can choose which building dashboard to open.
- [ ] When the selection contains too many Building points to identify a building, the user is prompted to zoom in or apply filters, and no ambiguous building dashboard opens.
- [ ] When building information is available, the dashboard shows building and floorplan summary information in sortable and filterable tables.
- [ ] When the building has floorplans, the dashboard displays their images and lets the user select a floorplan.
- [ ] Selecting a floorplan displays its image with the associated survey points overlaid.
- [ ] When the building has no floorplans, the dashboard displays available building details without an empty floorplan image area.
- [ ] While Building data is loading, a loading state is displayed.
- [ ] When Building data is unavailable, a no-data state is displayed.
- [ ] When Building data fails to load, an error state is displayed without incorrect building data.
