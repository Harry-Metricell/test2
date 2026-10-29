<!-- Testing scope: Automobile. Read config/testing-context/TEST2-81.json for source hierarchy and the human resolution of conflicting links. Do not substitute another module. -->
<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] Given HTTP Browsing results are available, when the HTTP Browsing layer is selected, each supplied result is displayed as a selectable point on the map.
- [ ] Given Ping results are available, when the Ping layer is selected, each supplied result is displayed as a selectable point on the map.
- [ ] Given Video Streaming results are available, when the Video Streaming layer is selected, each supplied result is displayed as a selectable point on the map.
- [ ] Given details are available for a result point, when the point is selected, a new detail dialog opens for that same result and displays its test type, result time, location, and available network technology/context.
- [ ] Given an HTTP Browsing point is selected and its details are available, the dialog displays that result’s Page Load Time.
- [ ] Given a Ping point is selected and its details are available, the dialog displays that result’s Ping Time.
- [ ] Given a Video Streaming point is selected and its details are available, the dialog displays that result’s Rebuffer Count.
- [ ] Given an HTTP Browsing result ends in error, when its point is displayed, it is visually distinct from a successful result; a zero Page Load Time on the failed result is not coloured as success.
- [ ] Given details cannot be returned for a selected point, the user sees a clear no-data or error message and no stale details are displayed.
