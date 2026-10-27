<!-- Testing scope: Automobile. Read config/testing-context/TEST2-86.json for source hierarchy and the human resolution of conflicting links. Do not substitute another module. -->
<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->
- [ ] Given a completed Upload test is selected and its details have loaded, the summary shows the test and device information available for that record, including Upload Rate and Wi-Fi connection status. Returned technology, user, handset, service, serving cell, duration, tested technologies and indoor/outdoor values are displayed accurately.
- [ ] Given Upload samples are available, a time-series chart shows Signal Strength in dBm and Upload Rate in Mbps across the test duration.
- [ ] Given per-sample Upload data is available, each returned sample is shown in a table with its relevant units.
- [ ] Given the per-sample table contains multiple rows, sorting by a displayed column changes their visible order according to that column.
- [ ] Given per-sample data is available, filtering the table shows only rows matching the selected filter.
- [ ] Given average signal metrics are returned, Average Signal Strength, Average Signal Quality, and Average SNR appear in the summary immediately after Upload Rate.
- [ ] Given an Upload point has no measurable duration, its row is disabled as the no-data state and selecting it does not open an empty details view.
- [ ] While Upload details are loading, the detail presentation shows the standard loading state.
- [ ] When Upload details are unavailable, the detail presentation shows the standard no-data state.
- [ ] When loading Upload details fails, the detail presentation shows the standard error state and does not display incorrect data.
