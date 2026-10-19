<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] Given a completed Download test is selected and its details have loaded, the summary shows the reported technology, user, handset, service, serving cell, duration, tested technologies, indoor/outdoor status, Download Rate, and Wi-Fi connection status.
- [ ] Given Download samples are available, a time-series chart shows Signal Strength in dBm and Download Rate in Mbps across the test duration.
- [ ] Given per-sample Download data is available, each returned sample is shown in a table with its relevant units.
- [ ] Given the per-sample table contains multiple rows, sorting by a displayed column changes their visible order according to that column.
- [ ] Given per-sample data is available, filtering the table shows only rows matching the selected filter.
- [ ] Given average signal metrics are returned, Average Signal Strength, Average Signal Quality, and Average SNR appear in the summary immediately after Download Rate.
- [ ] Given the selected Download point has no measurable duration, the detail presentation shows the standard no-data state instead of an empty detail view.
- [ ] Given Download details are loading, the detail presentation shows a loading state.
- [ ] Given Download details are unavailable, the detail presentation shows a no-data state.
- [ ] Given loading Download details fails, the detail presentation shows an error state and does not display incorrect data.
