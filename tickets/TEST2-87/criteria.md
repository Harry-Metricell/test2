<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] When a completed Call test is opened in the shared point-detail dialog, its summary shows the available duration, test result, connection time, start time, end time, handset, and disconnection cause.
- [ ] When Call samples are returned, the timeline chart shows call state, service technology, and signal strength across the test duration.
- [ ] When Call samples are returned, the dialog displays them in a table whose columns can be sorted and filtered.
- [ ] For each displayed Call sample, the Serving Cell column shows the known serving site/cell when available; when it is unavailable, it shows that sample’s CGI.
- [ ] Selecting a displayed Call sample opens the related Service details for the selected sample’s point in time.
- [ ] When the selected Call point has no measurable duration, the dialog shows the standard no-data state instead of an empty detail view.
- [ ] While Call details are loading, the dialog shows the standard loading state; when details are unavailable, it shows the standard no-data state; when loading fails, it shows the standard error state, with no incorrect Call data displayed.
