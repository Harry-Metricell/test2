# TEST2-87 Evidence Review

- **Ticket:** TEST2-87 — Display Call Point Details
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Failed:** When a completed Call test is opened in the shared point-detail dialog, its summary shows the available duration, test result, connection time, start time, end time, handset, and disconnection cause.
   - criterion-1-final.png and criterion-1-summary-bottom.png show the summary from Username through Error Message: Success, connection time 1310 and start/end times are present, but duration and handset are absent. Disconnection Cause Code is blank.
2. **Failed:** When Call samples are returned, the timeline chart shows call state, service technology, and signal strength across the test duration.
   - criterion-2-final.png shows the settled chart with signal strength and Call initiated/Connected/Call ended markers, but no service-technology track or series; 4G appears only in the separate summary and sample row.
3. **Unverified:** When Call samples are returned, the dialog displays them in a table whose columns can be sorted and filtered.
   - criterion-3-before-sort.png and criterion-3-final.png show identical headers and first sample 08:12:32.797 after the reported Time click. Only the table top is captured; no changed ordering or filtering interaction is demonstrated, and these views do not establish the absence of controls throughout the table.
4. **Passed:** For each displayed Call sample, the Serving Cell column shows the known serving site/cell when available; when it is unavailable, it shows that sample’s CGI.
   - criterion-4-resumed-known-cell.png shows Serving Cell 510633_124_4 for the 22/09/2026 call; criterion-4-final.png shows CGI-form value 234-30-3922178 for the 12/10/2026 call. The recovered criterion-owned sequence demonstrates both displayed representations.
5. **Unverified:** Selecting a displayed Call sample opens the related Service details for the selected sample’s point in time.
   - criterion-5-before-sample.png shows sample 22/09/2026 08:12:32.797 with cell 510633_124_4. criterion-5-final.png shows Selected measurement / Radio details with matching username and cell, but no selected timestamp is visible, so correspondence to the asserted point in time remains unproven.
6. **Blocked:** When the selected Call point has no measurable duration, the dialog shows the standard no-data state instead of an empty detail view.
   - criterion-6-final.png shows all five available Call events with distinct start/end times, each 20 seconds apart. No zero-duration or unmeasurable-duration Call fixture is identified in the supplied inputs; the required no-data branch could not be tested.
7. **Blocked:** While Call details are loading, the dialog shows the standard loading state; when details are unavailable, it shows the standard no-data state; when loading fails, it shows the standard error state, with no incorrect Call data displayed.
   - criterion-7-final.png shows successfully populated Call details. No reproducible Call unavailable/error fixture or captured loading state is supplied; unrelated layer errors do not exercise these Call-detail branches, which remain untested.

**Review summary:** Completed independent screenshot assessment of all seven criteria; required zero-duration and Call loading/unavailable/error evidence is unavailable.
