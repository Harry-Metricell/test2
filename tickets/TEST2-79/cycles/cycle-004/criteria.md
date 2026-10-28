<!-- Testing scope: Automobile. Read config/testing-context/TEST2-79.json for source hierarchy and the human resolution of conflicting links. Do not substitute another module. -->
<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] With neither layer selected, the map shows no Download or Upload test-result points.
- [ ] After selecting Download, the map shows selectable points for matching authorised Download results only.
- [ ] After selecting Upload, the map shows selectable points for matching authorised Upload results only.
- [ ] Selecting a Download result point opens its details dialog with Data Technology, MSISDN, Service, Serving Cell, Test Duration, Test Technologies, Download Rate, and Wi-Fi Connected.
- [ ] Selecting an Upload result point opens its details dialog with Data Technology, MSISDN, Service, Serving Cell, Test Duration, Test Technologies, Upload Rate, and Wi-Fi Connected.
- [ ] The Download result details chart plots Signal Strength in dBm and Download Rate in Mbps over time.
- [ ] The Upload result details chart plots Signal Strength in dBm and Upload Rate in Mbps over time.
- [ ] The Download details table displays MSISDN, Start Time, End Time, Download Rate, Band, Serving Cell, Service, Test Technologies, Data Technology, Wi-Fi Connected, URL, and Error Message.
- [ ] The Upload details table displays MSISDN, Start Time, End Time, Upload Rate, Band, Serving Cell, Service, Test Technologies, Data Technology, Wi-Fi Connected, URL, and Error Message.
- [ ] Where signal strength or rate values are shown, each value includes its applicable unit (dBm or Mbps).
- [ ] For a result whose Error Message is null, the details table displays “No Error”.
- [ ] Sorting a supported Download or Upload details-table column changes the displayed row order to match the selected sort.
- [ ] Filtering a supported Download or Upload details-table column displays rows matching the applied filter.
- [ ] Requesting details for a zero-duration test does not open a details dialog.
- [ ] While result details are loading, the interface shows a loading state without stale or misleading detail data.
- [ ] If result details fail to load, the interface shows an error state without stale or misleading detail data.
