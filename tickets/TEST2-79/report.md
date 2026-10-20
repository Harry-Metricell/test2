# TEST2-79 Evidence Review

- **Ticket:** TEST2-79 — Map and inspect Automobile Download and Upload results
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-002
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With neither layer selected, the map shows no Download or Upload test-result points.
   - criterion-1-before-automobile.png and criterion-1-final.png show the settled unobscured map with Automobile unselected and no Download or Upload result points in the visible viewport; criterion-1-after-automobile.png shows configuration only, with no layer added.
2. **Blocked:** After selecting Download, the map shows selectable points for matching authorised Download results only.
   - criterion-2-after-download.png and criterion-2-fresh-before-add.png show Download selected; criterion-2-after-add.png and criterion-2-final.png show its layer and legend without result points. Results record GET /api/platform/automobile/download/points returning HTTP 500 on both initial and controlled fresh loads, preventing checks of matching authorised results and selectability. The legend's Error category is not an error notification.
3. **Blocked:** After selecting Upload, the map shows selectable points for matching authorised Upload results only.
   - criterion-3-before-add.png shows Upload selected; criterion-3-after-add.png and criterion-3-final.png show its layer without result points. Results record GET /api/platform/automobile/upload/points returning HTTP 500 on initial and controlled fresh loads. Matching authorised results and selectability were unavailable; the stale-selector interaction error after reload does not establish an application defect.
4. **Blocked:** Selecting a Download result point opens its details dialog with Data Technology, MSISDN, Service, Serving Cell, Test Duration, Test Technologies, Download Rate, and Wi-Fi Connected.
   - criterion-4-blocked.png and criterion-4-final.png show only the reachable GIS map, with no result details. The recorded Download/Upload points-service HTTP 500 failures prevented obtaining a selectable Download point and its summary dialog; this assertion was not exercised.
5. **Blocked:** Selecting an Upload result point opens its details dialog with Data Technology, MSISDN, Service, Serving Cell, Test Duration, Test Technologies, Upload Rate, and Wi-Fi Connected.
   - criterion-5-blocked.png and criterion-5-final.png show only the reachable GIS map, with no result details. The recorded Download/Upload points-service HTTP 500 failures prevented obtaining a selectable Upload point and its summary dialog; this assertion was not exercised.
6. **Blocked:** The Download result details chart plots Signal Strength in dBm and Download Rate in Mbps over time.
   - criterion-6-blocked.png and criterion-6-final.png show only the reachable GIS map, with no result details. The recorded Download/Upload points-service HTTP 500 failures prevented obtaining a Download result details chart; this assertion was not exercised.
7. **Blocked:** The Upload result details chart plots Signal Strength in dBm and Upload Rate in Mbps over time.
   - criterion-7-blocked.png and criterion-7-final.png show only the reachable GIS map, with no result details. The recorded Download/Upload points-service HTTP 500 failures prevented obtaining an Upload result details chart; this assertion was not exercised.
8. **Blocked:** The Download details table displays MSISDN, Start Time, End Time, Download Rate, Band, Serving Cell, Service, Test Technologies, Data Technology, Wi-Fi Connected, URL, and Error Message.
   - criterion-8-blocked.png and criterion-8-final.png show only the reachable GIS map, with no result details. The recorded Download/Upload points-service HTTP 500 failures prevented obtaining a Download details table; this assertion was not exercised.
9. **Blocked:** The Upload details table displays MSISDN, Start Time, End Time, Upload Rate, Band, Serving Cell, Service, Test Technologies, Data Technology, Wi-Fi Connected, URL, and Error Message.
   - criterion-9-blocked.png shows map loading; criterion-9-final.png shows the settled map without a result details table. The recorded Download/Upload points-service HTTP 500 failures prevented obtaining an Upload details table; this assertion was not exercised.
10. **Blocked:** Where signal strength or rate values are shown, each value includes its applicable unit (dBm or Mbps).
   - criterion-10-blocked.png and criterion-10-final.png show only the reachable GIS map, with no result details. The recorded Download/Upload points-service HTTP 500 failures prevented obtaining result-detail signal strength or rate values; this assertion was not exercised.
11. **Blocked:** For a result whose Error Message is null, the details table displays “No Error”.
   - criterion-11-blocked.png and criterion-11-final.png show only the reachable GIS map, with no result details. The recorded Download/Upload points-service HTTP 500 failures prevented obtaining a result with a known null Error Message and its details table; this assertion was not exercised.
12. **Blocked:** Sorting a supported Download or Upload details-table column changes the displayed row order to match the selected sort.
   - criterion-12-blocked.png and criterion-12-final.png show only the reachable GIS map, with no result details. The recorded Download/Upload points-service HTTP 500 failures prevented obtaining multiple result-detail rows to compare before and after sorting; this assertion was not exercised.
13. **Blocked:** Filtering a supported Download or Upload details-table column displays rows matching the applied filter.
   - criterion-13-blocked.png and criterion-13-final.png show only the reachable GIS map, with no result details. The recorded Download/Upload points-service HTTP 500 failures prevented obtaining result-detail rows and an applied column filter; this assertion was not exercised.
14. **Blocked:** Requesting details for a zero-duration test does not open a details dialog.
   - criterion-14-blocked.png and criterion-14-final.png show only the reachable GIS map, with no result details. The recorded Download/Upload points-service HTTP 500 failures prevented obtaining a known zero-duration result and a request for its details; this assertion was not exercised.
15. **Blocked:** While result details are loading, the interface shows a loading state without stale or misleading detail data.
   - criterion-15-blocked.png and criterion-15-final.png show the settled map without a detail request; they do not show result-detail loading. The recorded Download/Upload points-service HTTP 500 failures prevented obtaining a result-detail request whose loading state can be observed; this assertion was not exercised.
16. **Blocked:** If result details fail to load, the interface shows an error state without stale or misleading detail data.
   - criterion-16-initial.png shows application initialization and criterion-16-blocked.png shows map loading; criterion-16-final.png shows the settled map. These are not a result-detail error state. The recorded Download/Upload points-service HTTP 500 failures prevented obtaining a failed result-detail request whose error state can be observed; this assertion was not exercised.

**Review summary:** Reviewed attempt-002 evidence against all 16 canonical criteria. The unselected-layer visible map state is evidenced; recorded reproducible Download and Upload points-service HTTP 500 failures prevented the remaining result-dependent checks.
