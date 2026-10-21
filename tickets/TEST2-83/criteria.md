<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->
<!-- Verified testing context (2026-10-21): Surveyor > Active layer: Service. Source VM2ST-105 explicitly links VM2ST-115 (Open Individual Surveyor Point Details) and VM2ST-118 (Select Multiple Surveyor Point Layers). This is not Automobile Service. Source references: https://metricell.atlassian.net/browse/VM2ST-105 https://metricell.atlassian.net/browse/VM2ST-115 https://metricell.atlassian.net/browse/VM2ST-118 . Setup/provenance only; acceptance criteria below are unchanged. -->

- [ ] Given a Service point's details have loaded in the shared point-detail dialog, the standard detail presentation shows the returned serving-cell information.
- [ ] Given the loaded Service point details include neighbour-cell data, each returned neighbour appears in its own distinct section beneath the serving-cell information.
- [ ] Given the loaded Service point details contain no neighbour-cell data, serving-cell information remains visible and no empty neighbour section appears.
- [ ] Given displayed Service point detail rows are available, sorting the rows changes their visible order according to the selected sort, and filtering them shows only rows matching the selected filter.
- [ ] Given a Service point's reported radio generation is 2G, 3G, 4G, 5G NSA, or 5G SA, the visible KPI names are appropriate to that generation.
- [ ] Given 5G SA is selected and the user opens a Service point in the shared point-detail dialog, the Service point detail presentation loads without an error state.
- [ ] Given Service point details are loading, the detail presentation shows a loading state.
- [ ] Given Service point details are unavailable, the detail presentation shows a no-data state.
- [ ] Given loading Service point details fails, the detail presentation shows an error state and does not show incorrect detail data.
