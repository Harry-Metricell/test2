# TEST2-79 Evidence Review

- **Ticket:** TEST2-79 — Map and inspect Automobile Download and Upload results
- **QA status:** Evidence Reviewed
- **Overall outcome:** Unverified
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With neither layer selected, the map shows no Download or Upload test-result points.
   - criterion-1-after-open-gis.png and criterion-1-final.png show the settled unobscured map remained empty with no selected result layers; criterion-1-test-type-choices.png identifies Download and Upload within Automobile.
2. **Passed:** After selecting Download, the map shows selectable points for matching authorised Download results only.
   - criterion-2-download-config.png selects Automobile Download; criterion-2-final.png shows Download markers and the opened matching Download tests table. Results record GET /api/platform/automobile/download/points HTTP 200 through the authenticated session.
3. **Passed:** After selecting Upload, the map shows selectable points for matching authorised Upload results only.
   - criterion-3-before-select-point.png shows Automobile Upload markers; criterion-3-final.png shows the selected marker's matching Upload tests table. Results record GET /api/platform/automobile/upload/points HTTP 200.
4. **Unverified:** Selecting a Download result point opens its details dialog with Data Technology, MSISDN, Service, Serving Cell, Test Duration, Test Technologies, Download Rate, and Wi-Fi Connected.
   - criterion-4-final.png shows Download test 132737467, MSISDN, rate, serving cell, service and test technologies; criterion-4-final-summary-lower.png shows Technology and duration 31.795 s. The latter starts midway through the Wi-Fi Connected row with its value above the viewport, so the required Wi-Fi summary field/value is not directly evidenced.
5. **Passed:** Selecting an Upload result point opens its details dialog with Data Technology, MSISDN, Service, Serving Cell, Test Duration, Test Technologies, Upload Rate, and Wi-Fi Connected.
   - criterion-5-summary-upper.png and criterion-5-final.png show Upload test 132737469 with MSISDN, service, serving cell, test technologies, 18.44 Mbps rate, Wi-Fi Connected No, Technology 5G NSA and duration 0.434 s.
6. **Passed:** The Download result details chart plots Signal Strength in dBm and Download Rate in Mbps over time.
   - criterion-6-final.png directly shows the Download analysis chart with Signal strength and Download Rate series, dBm/Mbps axes and Seconds time axis.
7. **Passed:** The Upload result details chart plots Signal Strength in dBm and Upload Rate in Mbps over time.
   - criterion-7-final.png directly shows Upload test 132737415 with Signal strength and Upload Rate series, dBm/Mbps axes and Seconds time axis.
8. **Passed:** The Download details table displays MSISDN, Start Time, End Time, Download Rate, Band, Serving Cell, Service, Test Technologies, Data Technology, Wi-Fi Connected, URL, and Error Message.
   - criterion-8-table-left.png and criterion-8-final.png together show all specified Download table columns. Start, End and Error are the displayed labels for Start Time, End Time and Error Message.
9. **Passed:** The Upload details table displays MSISDN, Start Time, End Time, Upload Rate, Band, Serving Cell, Service, Test Technologies, Data Technology, Wi-Fi Connected, URL, and Error Message.
   - criterion-9-table-left.png and criterion-9-final.png together show all specified Upload table columns, including Upload Rate, Data Technology, Wi-Fi Connected, URL and Error.
10. **Unverified:** Where signal strength or rate values are shown, each value includes its applicable unit (dBm or Mbps).
   - criterion-10-download-table-units.png, criterion-10-download-chart-units.png and criterion-10-download-measurement-units.png show Mbps rates and dBm signal values/axes. Upload table and chart captures show Mbps/dBm axes, but criterion-10-final.png still shows the chart and filter rather than Upload measurement rows; the claimed per-value Upload measurement units lack direct screenshot evidence.
11. **Passed:** For a result whose Error Message is null, the details table displays “No Error”.
   - criterion-11-table-left.png identifies test 132737467 and criterion-11-final.png shows its corresponding first row as No Error; the results record errorMessage null for that test in the real Automobile Download cluster-details response.
12. **Passed:** Sorting a supported Download or Upload details-table column changes the displayed row order to match the selected sort.
   - criterion-12-tests-before-sort.png establishes populated original order; criterion-12-tests-first-sort.png shows ascending Download Rate values starting 0.38, 1.15, 2.51 Mbps; criterion-12-final.png shows descending values starting 364.12, 297.28, 277.15 Mbps with the matching sort arrows.
13. **Passed:** Filtering a supported Download or Upload details-table column displays rows matching the applied filter.
   - criterion-13-before-filter.png shows the populated Download table; criterion-13-final.png shows filter 132737467 and only that matching row. criterion-13-filter-restored.png shows the cleared filter and restored visible baseline rows. The supported shared filter searches the Test ID column.
14. **Passed:** Requesting details for a zero-duration test does not open a details dialog.
   - criterion-14-before-zero-duration-click.png identifies Upload test 132685097 with equal start/end times and N/A rate; criterion-14-final.png retains the tests table without an individual detail tab after the recorded click. The real cluster-details response confirms zero duration.
15. **Passed:** While result details are loading, the interface shows a loading state without stale or misleading detail data.
   - SIMULATED UI STATE: Automobile Download analysis UI only on https://o2intelligence-v4-dev.metricell.com/gis. Results document an owned POST /api/platform/automobile/download/test-analysis read limited to pointId 132737365 held 30289 ms and released unchanged, with genuine prior responses establishing the contract. criterion-15-distinct-valid-before-simulation.png shows prior record 132737467; criterion-15-target-real-load.png establishes target 132737365; criterion-15-final.png shows Loading Automobile test analysis... with the correct target summary and no prior analysis. criterion-15-recovery.png restores the target chart after genuine HTTP 200; criterion-15-cleanup.png restores the empty map. Results verify pending-request settlement and exact handler removal in finally. This demonstrates scoped analysis loading UI, not backend latency or every detail endpoint.
16. **Passed:** If result details fail to load, the interface shows an error state without stale or misleading detail data.
   - SIMULATED UI STATE: Automobile Download analysis UI only on https://o2intelligence-v4-dev.metricell.com/gis. Results document one browser-local HTTP 503 text/plain Service Unavailable for the owned POST /api/platform/automobile/download/test-analysis read limited to pointId 132737365; HTTP status provenance is RFC 9110 section 15.6.4, with no backend-body contract claimed. criterion-16-distinct-valid-before-simulation.png shows prior record 132737467; criterion-16-target-real-load.png establishes target 132737365; criterion-16-final.png shows Unable to load Automobile test analysis. and Retry with correct target summary and no stale prior analysis. criterion-16-recovery.png restores the target chart after genuine HTTP 200 Retry; criterion-16-cleanup.png restores the empty map. Results verify request settlement and exact handler removal in finally. This demonstrates scoped analysis error UI, not a real backend failure or every detail endpoint.

**Review summary:** Independent review of cycle-002 attempt-001 completed against the human-confirmed Automobile scope. All 171 referenced PNGs exist and are non-empty. Summary Wi-Fi visibility and Upload measurement-unit capture gaps remain unverified; no confirmed product defect. Criteria 15 and 16 retain scoped simulation disclosures.
