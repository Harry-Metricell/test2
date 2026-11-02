# TEST2-87 Evidence Review

- **Ticket:** TEST2-87 — Display Call Point Details
- **QA status:** Evidence Reviewed
- **Overall outcome:** Unverified
- **Evidence reviewed:** 1
- **Report:** [Evidence report](report.pdf)
- **Editable report:** [Download Word (.docx)](report.docx)

## Criterion results

1. **Passed:** When a completed Call test is opened in the shared point-detail dialog, its summary shows the available duration, test result, connection time, start time, end time, handset, and disconnection cause.
   - criterion-1-summary-decisive.png and criterion-1-summary-middle.png show the completed Automobile Call summary: Success, duration 70 s, connection time 1888 ms, start 19/08/2026 09:34:39, end 09:35:49, and handset identifier MSISDN 447925375897. Disconnection Cause Code is N/A, consistent with the reported null value; the source requires available fields, not an invented cause or unreturned handset model.
2. **Unverified:** When Call samples are returned, the timeline chart shows call state, service technology, and signal strength across the test duration.
   - The user confirmed that Service is the acceptable service-technology presentation. Signal strength and duration coverage were already verified. Complete returned call-state timeline coverage remains unverified in the supplied captures; initiation/end annotations alone do not prove it.
3. **Passed:** When Call samples are returned, the dialog displays them in a table whose columns can be sorted.
   - Filtering was removed from the current acceptance scope by the user on 2 November. Existing readable evidence proves the displayed samples and Signal Strength sorting in both directions. The 27 October supplemental investigation also verifies differing-value order for Time, Call State, Site and Cell. Constant-value columns permit direction toggling but cannot establish differing-value order; no exhaustive all-column ordering claim is made.
4. **Passed:** For each displayed Call sample, the Serving Cell column shows the known serving site/cell when available; when it is unavailable, it shows that sample’s CGI.
   - Human acceptance: the user confirmed that the separate Site and Cell columns are acceptable. Existing evidence reconciles the two bounded datasets and proves the CGI fallback when a value is supplied. This corrects the column-label interpretation; no new browser test was performed.
5. **Passed:** Selecting a displayed Call sample opens the related Service details for the selected sample’s point in time.
   - Existing 27 October supplemental navigation evidence shows selected sample 19 August 09:35:17.33 and the expanded destination title 19/08/2026, 09:35:17, with matching cell 105_120_4 and -91 dBm Service fields. The built-in Open in a new window action exposed the full title; no DOM content was altered.
6. **Passed:** When the selected Call point has no measurable duration, the dialog shows the standard no-data state instead of an empty detail view.
   - Genuine zero-duration Automobile Call test 132762259 (12 October 2026, 19:42:27; identical start/end and raw testDurationMs 0) opens the standard No data available state. It was selected normally after a populated 70-second Call; the old chart and sample table are absent and the correct zero-duration summary remains visible. No simulation was used.
7. **Passed:** While Call details are loading, the dialog shows the standard loading state; when details are unavailable, it shows the standard no-data state; when loading fails, it shows the standard error state, with no incorrect Call data displayed.
   - The existing disclosed delayed-request and HTTP 503 checks establish loading/error handling. A new genuine no-data fixture now completes the unavailable-analysis branch: after displaying a populated Call, normal selection of zero-duration Call 132762259 shows No data available, retains only its correct summary and clears the earlier chart/sample table. This proves the actual no-analysis case, not arbitrary missing-record or backend-error schemas. New fixture check was not simulated; the older loading/error checks remain explicitly simulated.

**Review summary:** Six criteria Passed; complete call-state chart coverage in criterion 2 remains Unverified. Filtering is out of scope on user authority. The genuine zero-duration Call fixture resolves criteria 6 and 7 without simulation or a full retest.
