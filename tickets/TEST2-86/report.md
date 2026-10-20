# TEST2-86 Evidence Review

- **Ticket:** TEST2-86 — Display Upload Point Details
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-002
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Failed:** Given a completed Upload test is selected and its details have loaded, the summary shows the reported technology, user, handset, service, serving cell, duration, tested technologies, indoor/outdoor status, Upload Rate, and Wi-Fi connection status.
   - criterion-1-summary-top.png, criterion-1-summary-middle.png and criterion-1-final.png cover the summary from top to bottom: user, handset, technology, cell, Upload Rate, Wi-Fi and indoor/outdoor fields are visible, but duration and service fields are absent; start/end timestamps alone do not display duration.
2. **Passed:** Given Upload samples are available, a time-series chart shows Signal Strength in dBm and Upload Rate in Mbps across the test duration.
   - criterion-2-final.png shows Signal strength and Upload rate series against Seconds, with dBm and Mbps axes and plotted samples spanning about 2.1 seconds.
3. **Failed:** Given per-sample Upload data is available, each returned sample is shown in a table with its relevant units.
   - criterion-3-final.png shows ten timestamped sample rows and signal values in dBm, but Upload Rate and Size have no units in either headers or cells.
4. **Failed:** Given the per-sample table contains multiple rows, sorting by a displayed column changes their visible order according to that column.
   - criterion-4-before-sort.png and criterion-4-final.png show the same ten-row Upload Rate order after the recorded header click (60.16, 196.99, 138.33 ... 132.93); it is neither ascending nor descending.
5. **Failed:** Given per-sample data is available, filtering the table shows only rows matching the selected filter.
   - criterion-5-after-open-details.png shows the chart and table entrance; criterion-5-final.png and criterion-5-analysis.png expose the populated table and full horizontal span. No per-sample filter control is displayed and all ten rows remain visible, consistent with the recorded inability to select a filter.
6. **Blocked:** Given average signal metrics are returned, Average Signal Strength, Average Signal Quality, and Average SNR appear in the summary immediately after Upload Rate.
   - criterion-6-final.png shows Band immediately after Upload Rate, with no average metrics. The recorded event-analysis response contains empty details and no returned average fields; a fixture returning Average Signal Strength, Average Signal Quality and Average SNR is unavailable, so conditional placement cannot be assessed.
7. **Blocked:** Given the selected Upload point has no measurable duration, the detail presentation shows the standard no-data state instead of an empty detail view.
   - criterion-7-final.png shows start 10:34:58 and end 10:35:01; criterion-7-after-open-details.png shows a populated analysis. This event has measurable duration; no zero-duration Upload fixture was available to exercise the required no-data state.
8. **Passed:** While Upload details are loading, the detail presentation shows the standard loading state.
   - criterion-8-final.png directly shows the analysis progress bar and Loading... while the recorded real request was delayed. criterion-8-cleanup-loaded.png shows the chart and samples after release; the recovered run supports the loading assertion despite the earlier route-helper error.
9. **Passed:** When Upload details are unavailable, the detail presentation shows the standard no-data state.
   - criterion-9-final.png shows No chart data is available. and No results are available., with no chart or sample table, after the recorded controlled empty HTTP 200 response. This verifies the induced empty-response UI path.
10. **Passed:** When loading Upload details fails, the detail presentation shows the standard error state and does not display incorrect data.
   - criterion-10-final.png shows Unable to load details. and Retry with no chart or sample table after the recorded controlled HTTP 500 response. The selected-event summary remains visible; criterion-10-cleanup-recovered.png shows chart/sample recovery after removing interception and retrying.

**Review summary:** Reviewed attempt-002 screenshots against all ten criteria; average-metric and zero-duration fixtures remain unavailable.
