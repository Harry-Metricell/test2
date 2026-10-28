<!-- Testing scope: Automobile. Read config/testing-context/TEST2-83.json for source hierarchy and the human resolution of conflicting links. Do not substitute another module. -->
<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->
- [ ] Given a Service point's details have loaded in the shared point-detail dialog, the standard detail presentation shows the returned serving-cell information.
- [ ] Given the loaded Service point details include neighbour-cell data, each returned neighbour appears in its own distinct section beneath the serving-cell information.
- [ ] Given the loaded Service point details contain no neighbour-cell data, serving-cell information remains visible and no empty neighbour section appears.
- [ ] Given displayed Service point detail rows are available, sorting the rows changes their visible order according to the selected sort, and filtering them shows only rows matching the selected filter.
- [ ] Given a Service point's reported radio generation is 2G, 3G, 4G, 5G NSA, or 5G SA, the visible KPI names are appropriate to that generation.
- [ ] Given 5G SA is selected and the user opens a Service point in the shared point-detail dialog, the Service point detail presentation loads without an error state.
- [ ] Given Service point details are loading, the detail presentation shows a loading state without displaying incorrect detail data.
- [ ] Given Service point details are unavailable, the detail presentation shows a no-data state without displaying incorrect detail data.
- [ ] Given loading Service point details fails, the detail presentation shows an error state and does not show incorrect detail data.
