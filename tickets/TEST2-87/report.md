# TEST2-87 Evidence Review

- **Ticket:** TEST2-87 — Display Call Point Details
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** 1
- **Report:** [Evidence report](report.pdf)
- **Editable report:** [Download Word (.docx)](report.docx)

## Criterion results

1. **Passed:** When a completed Call test is opened in the shared point-detail dialog, its summary shows the available duration, test result, connection time, start time, end time, handset, and disconnection cause.
   - criterion-1-summary-decisive.png and criterion-1-summary-middle.png show the completed Automobile Call summary: Success, duration 70 s, connection time 1888 ms, start 19/08/2026 09:34:39, end 09:35:49, and handset identifier MSISDN 447925375897. Disconnection Cause Code is N/A, consistent with the reported null value; the source requires available fields, not an invented cause or unreturned handset model.
2. **Passed:** When Call samples are returned, the timeline chart shows call state, service technology, and signal strength across the test duration.
   - Focused live check on 2 November: the built-in expanded Call analysis view for 5 October 2026, 19:35:02 displays Call initiated (CI), Connected (CC) and Call ended (CE) annotations over the signal-strength timeline spanning the 70-second test. The readable returned samples show Idle, Off Hook and Connected transitions; the chart marks initiation, connection and end. The source asks for call state over time, without prescribing a separate continuous state series or lane. The prior Unverified interpretation imposed that extra presentation requirement. Service technology is shown as Service in the same analysis view, accepted by the user. This is a source-aligned reassessment with a fresh chart capture, not a new full attempt.
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

**Review summary:** All seven criteria passed within the user-confirmed scope. Filtering is excluded; Service and separate Site/Cell presentation are accepted. Fresh chart evidence resolves the prior overly restrictive call-state interpretation. Genuine zero-duration/no-data checks passed; earlier loading/error checks remain disclosed simulations.
