<!-- Testing scope: Automobile. Read config/testing-context/TEST2-80.json for source hierarchy and the human resolution of conflicting links. Do not substitute another module. -->
<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] The map layer selector includes Service as a selectable layer.
- [ ] With Service unselected, the map displays no Service test-result points.
- [ ] When the user selects Service and matching authorised results are available, each matching result is displayed as a selectable map point.
- [ ] When the user selects a Service result point and its details load successfully, a Service details dialog displays MSISDN, Test Time, Signal, Band, Service, Data Technology, PLMN and Serving Cell.
- [ ] With the Service details table displayed, sorting a supported column reorders the displayed rows according to that column.
- [ ] With the Service details table displayed, filtering a supported column limits the displayed rows to those matching the filter.
- [ ] When returned details include cell-neighbour data, the dialog displays each neighbour in its own labelled details table.
- [ ] While Service details are loading, the dialog displays a loading state.
- [ ] If Service details cannot be retrieved, the dialog displays an error state and does not display stale details.
