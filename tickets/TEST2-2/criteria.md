# TEST2-2 acceptance criteria

Source: Jira description (automatically extracted)
Jira: https://metricell.atlassian.net/browse/TEST2-2

- [ ] Given a user is viewing Voice Call, MS Teams Call, Data Speed, Service, Video Streaming, Browsing, FTP, SMS or Email, when the report loads, then an Export action is available.
- [ ] Given a user is viewing Overview, when the report loads, then an Export action is not available.
- [ ] Given a user selects Export from a supported view, when the export completes, then an Excel file containing that view’s export data is downloaded.
- [ ] Given a user changes the Beacon or date range, when they export a supported view, then the generated file reflects the current Beacon and selected range.
- [ ] Given the file is downloaded, when its filename is generated, then it identifies the report type and export date.
- [ ] Given export data is unavailable or the request fails, when the user attempts an export, then the standard error or empty response is shown without exposing data outside their existing access.
