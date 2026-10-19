# TEST2-85 Evidence Review

- **Ticket:** TEST2-85 — Display Download Point Details
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-002
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Unverified:** Given a completed Download test is selected and its details have loaded, the summary shows the reported technology, user, handset, service, serving cell, duration, tested technologies, indoor/outdoor status, Download Rate, and Wi-Fi connection status.
   - criterion-1-final.png shows username, start/end times, Download Rate, band, serving cell, data/test technologies and Wi-Fi, but the summary continues below the viewport. Handset, service, duration and indoor/outdoor status are not established by the captured summary.
2. **Passed:** Given Download samples are available, a time-series chart shows Signal Strength in dBm and Download Rate in Mbps across the test duration.
   - criterion-2-after-select-cluster.png identifies the completed Download from 11:01:08 to 11:01:27. criterion-2-final.png shows Signal strength and Download rate series, dBm/Mbps axes and Seconds across approximately 0–19 seconds, matching that duration.
3. **Blocked:** Given per-sample Download data is available, each returned sample is shown in a table with its relevant units.
   - The reported recovery capture criterion-3-after-reset-restored-layer.png is missing. criterion-3-after-select-cluster.png and criterion-3-final.png show a recovered Download and its table header/first row, with dBm on Signal Strength but no units on Download Rate or Size. The claimed transition capture is unavailable and the full returned sample table is not captured.
4. **Blocked:** Given the per-sample table contains multiple rows, sorting by a displayed column changes their visible order according to that column.
   - The reported cluster-selection timeout prevented sorting. criterion-4-blocker.png shows HTTP Browsing details while both HTTP Browsing and Surveyor - Download layers are selected, contradicting the note that no Download layer remained. No criterion-owned Download table sorting sequence is available.
5. **Unverified:** Given per-sample data is available, filtering the table shows only rows matching the selected filter.
   - criterion-5-after-open-details.png and criterion-5-final.png show the chart and only the measurement header/first row at the bottom of the viewport. No sample-filter action or matching-row result is captured; the remaining table/control area is not visible, so screenshots do not establish the claimed absence of all filtering controls.
6. **Blocked:** Given average signal metrics are returned, Average Signal Strength, Average Signal Quality, and Average SNR appear in the summary immediately after Download Rate.
   - The tester reports no average metrics returned and no matching fixture. criterion-6-final.png shows Download Rate followed by Band and Serving Cell, without average metrics in that visible section. A fixture returning Average Signal Strength, Average Signal Quality and Average SNR is unavailable, so their conditional ordering cannot be assessed.
7. **Blocked:** Given the selected Download point has no measurable duration, the detail presentation shows the standard no-data state instead of an empty detail view.
   - criterion-7-final.png shows a populated Download with start/end times 11:01:08 and 11:01:27 and a chart spanning that interval. The required no-measurable-duration fixture was not identified, so the standard no-data presentation could not be exercised.
8. **Unverified:** Given Download details are loading, the detail presentation shows a loading state.
   - criterion-8-after-open-details.png and criterion-8-final.png already show the loaded summary, chart and sample header/row. Neither captures Download details loading, so a transient loading presentation is unproven.
9. **Blocked:** Given Download details are unavailable, the detail presentation shows a no-data state.
   - criterion-9-final.png shows successfully loaded Download summary, chart and sample data. The reported unavailable-details fixture was not supplied or identified, so the required no-data state could not be exercised.
10. **Blocked:** Given loading Download details fails, the detail presentation shows an error state and does not display incorrect data.
   - The reported removal-control timeout prevented setup of the Download error-state check. criterion-10-blocker.png shows an HTTP Browsing layer and legend without Download details; no failing Download load or resulting error presentation was exercised.

**Review summary:** Reviewed all ten canonical criteria against live attempt-002 results and local evidence. All 82 listed PNGs exist and are non-empty; an additional recovery capture claimed in criterion 3 is missing. Required fixtures and browser setup remain blocked, while summary, filtering and loading evidence is inconclusive.
