<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] Given the user opens a loaded Voice Call Beacon report, when the view is displayed, then an Export action is visible and available.
- [ ] Given the user opens a loaded MS Teams Call Beacon report, when the view is displayed, then an Export action is visible and available.
- [ ] Given the user opens a loaded Data Speed Beacon report, when the view is displayed, then an Export action is visible and available.
- [ ] Given the user opens a loaded Service Beacon report, when the view is displayed, then an Export action is visible and available.
- [ ] Given the user opens a loaded Video Streaming Beacon report, when the view is displayed, then an Export action is visible and available.
- [ ] Given the user opens a loaded Browsing Beacon report, when the view is displayed, then an Export action is visible and available.
- [ ] Given the user opens a loaded FTP Beacon report, when the view is displayed, then an Export action is visible and available.
- [ ] Given the user opens a loaded SMS Beacon report, when the view is displayed, then an Export action is visible and available.
- [ ] Given the user opens a loaded Email Beacon report, when the view is displayed, then an Export action is visible and available.
- [ ] Given the user opens a loaded Overview Beacon report, when the view is displayed, then no Export action is visible or available.
- [ ] Given a supported report view is loaded with export data, when the user selects Export, then an Excel file containing that view's export data is downloaded.
- [ ] Given a supported report view is loaded for Beacon A and date range A, when the user changes the selection to Beacon B and date range B and exports, then the downloaded workbook reflects Beacon B and date range B rather than the previous selections.
- [ ] Given a supported report view is loaded and an export is requested, when the file is downloaded, then its filename identifies the report type and export date.
- [ ] Given a supported report view has no export data, when the user selects Export, then the product's standard empty-data response is shown and no misleading populated workbook is downloaded.
- [ ] Given a supported report view's export request fails, when the user selects Export, then the product's standard error response is shown and the failure does not expose data beyond the user's existing access.
- [ ] Given the user is authenticated with access to a defined Beacon and tenant, when the user exports a supported report view, then the workbook contains only data permitted by that user's existing Beacon and tenant access.
- [ ] Given a supported report view is loaded, when the user uses its Export action, then the report data is exported without changing the underlying report data and no chart or PDF export is offered.
