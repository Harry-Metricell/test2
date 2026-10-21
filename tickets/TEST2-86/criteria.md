<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->
<!-- Verified testing context (2026-10-21): Surveyor > Active layer: Upload. Source VM2ST-108 links VM2ST-115 and VM2ST-118 (Surveyor point details and layers). This is not Automobile Upload. Source references: https://metricell.atlassian.net/browse/VM2ST-108 https://metricell.atlassian.net/browse/VM2ST-115 https://metricell.atlassian.net/browse/VM2ST-118 . Setup/provenance only; acceptance criteria below are unchanged. -->

- [ ] Given a completed Upload test is selected and its details have loaded, the summary shows the reported technology, user, handset, service, serving cell, duration, tested technologies, indoor/outdoor status, Upload Rate, and Wi-Fi connection status.
- [ ] Given Upload samples are available, a time-series chart shows Signal Strength in dBm and Upload Rate in Mbps across the test duration.
- [ ] Given per-sample Upload data is available, each returned sample is shown in a table with its relevant units.
- [ ] Given the per-sample table contains multiple rows, sorting by a displayed column changes their visible order according to that column.
- [ ] Given per-sample data is available, filtering the table shows only rows matching the selected filter.
- [ ] Given average signal metrics are returned, Average Signal Strength, Average Signal Quality, and Average SNR appear in the summary immediately after Upload Rate.
- [ ] Given the selected Upload point has no measurable duration, the detail presentation shows the standard no-data state instead of an empty detail view.
- [ ] While Upload details are loading, the detail presentation shows the standard loading state.
- [ ] When Upload details are unavailable, the detail presentation shows the standard no-data state.
- [ ] When loading Upload details fails, the detail presentation shows the standard error state and does not display incorrect data.
