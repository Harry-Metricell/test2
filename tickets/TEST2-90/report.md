# TEST2-90 Evidence Review

- **Ticket:** TEST2-90 — Map and inspect Automobile call results
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-002
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Blocked:** With Automobile Call results available, selecting the Call layer displays the results as selectable map points.
   - criterion-1-after-select-call.png shows Call selected; criterion-1-after-add-call.png and criterion-1-final.png show its legend but no selectable Call points. Results report a repeated HTTP 500 from GET /api/platform/automobile/call/points; available Call data could not be obtained. The map does not establish a settled empty dataset.
2. **Passed:** The shared Colour By selector offers CSR, Downlink MOS, Uplink MOS, and Estimated MOS, with CSR selected by default.
   - criterion-2-after-reset-own-call-layer.png establishes removal of the prior layer; criterion-2-fresh-layer-dialog.png and criterion-2-after-fresh-call-choice.png show creation of a fresh Call layer. criterion-2-fresh-default-csr.png shows CSR before any metric selection, and criterion-2-final.png lists CSR, Downlink MOS, Uplink MOS and Estimated MOS.
3. **Blocked:** For each Colour By choice, visible Call markers use that metric's values and the legend shows its matching title, units, categories, and colours; CSR is shown as a percentage and MOS as dimensionless scores.
   - criterion-3-initial.png shows the launcher only. The reported Call points HTTP 500 prevented metric-specific marker comparisons; marker values, matching legend behaviour and units across all choices were not exercised.
4. **Blocked:** Changing Colour By preserves the current date, filters, group visibility, marker identities, and selected result.
   - criterion-4-initial.png shows the launcher only. Call points retrieval was reported to fail with HTTP 500, leaving no marker identities or selected result for the required before/change/after preservation comparison.
5. **Blocked:** For a marker representing multiple calls, CSR is 100 × successful calls divided by successful, setup-failed, operator-answered, no-service, and invalid calls; dropped calls are excluded and a zero denominator produces zero. Each MOS value is weighted by that metric's own valid sample count, and Estimated MOS uses its dedicated values rather than an average of Downlink and Uplink MOS.
   - criterion-5-initial.png shows the launcher only. The reported Call points HTTP 500 prevented obtaining a multi-call marker, call outcome counts and separate MOS sample counts needed to verify the calculations and zero-denominator case.
6. **Blocked:** The default CSR legend uses green #31AA4F for 95–100%, light green #86BE42 for 90–<95%, yellow #FCBF1A for 85–<90%, red #E61733 for 80–<85%, and dark red #AE1A32 for 0–<80%; exact boundaries use the higher band.
   - criterion-6-final.png shows descending CSR thresholds and the five visible band colours. The reported Call points HTTP 500 prevented exact-boundary marker checks; legend labels alone do not establish classification at the boundaries.
7. **Blocked:** Each default MOS legend uses dark red #AE1A32 for 1–<2, yellow #FCBF1A for 2–<3, light green #86BE42 for 3–<4, and green #31AA4F for 4–5 inclusive; exact internal boundaries use the higher band.
   - criterion-7-after-downlink-mos.png, criterion-7-after-uplink-mos.png and criterion-7-final.png show all three MOS legends with descending intervals, four colours and inclusive upper bound 5. Exact-boundary data classification remained blocked by the reported Call points HTTP 500.
8. **Blocked:** When the selected MOS metric has no valid samples, it is unavailable rather than shown as zero or replaced by another metric; values outside its bands use the white, initially hidden Out of Threshold category, with no separate Not Tested category.
   - criterion-8-initial.png shows the launcher only. The reported Call points HTTP 500 prevented selecting results with missing samples or out-of-band values, so unavailable values, substitution and category behaviour could not be checked.
9. **Blocked:** The CSR legend shows 2G circles, 3G triangles, 4G diamonds, 5G SA pentagons, and a fixed black-square No Service category for generation 0; No Service is separate from CSR percentage bands.
   - criterion-9-legend-top.png shows No Service separately with a black square, 2G circles, 3G triangles and 4G diamonds; criterion-9-final.png shows 5G SA pentagons. The reported Call points HTTP 500 prevented generation-0 data verification, and no category-edit sequence establishes immutability.
10. **Passed:** The MOS legends use squares for Downlink MOS, circles for Uplink MOS, and hexagons for Estimated MOS, grouping by the selected metric.
   - criterion-10-before-downlink-mos.png shows the CSR baseline. criterion-10-after-downlink-mos.png shows square Downlink bands, criterion-10-after-uplink-mos.png shows circular Uplink bands, and criterion-10-after-estimated-mos.png and criterion-10-final.png show hexagonal Estimated bands. Each selected metric has its own single metric heading rather than repeated generation groups.
11. **Blocked:** Each Call legend includes a fixed white-square Out of Threshold category hidden by default; bands are ordered descending, with CSR limits 0–100 and MOS limits 1–5, and displayed labels match the boundary behaviour.
   - criterion-11-initial.png shows the launcher only. Fixed category definitions, default limits and label agreement with actual boundary classification were not exercised; boundary results were unavailable because Call points retrieval reportedly returned HTTP 500.
12. **Blocked:** Editing a metric's customisable bands, labels, marker size, or category visibility updates its Call markers and remains specific to that metric and layer instance when Colour By changes; No Service and Out of Threshold definitions cannot be edited.
   - criterion-12-initial.png shows the launcher only. Call markers were unavailable following the reported points HTTP 500, preventing the required edited-marker comparison and metric/layer isolation sequence; immutable category controls were not exercised.
13. **Blocked:** Restoring a Call layer or saved GIS view restores its Colour By choice and associated legend settings; a saved configuration without a choice opens with CSR selected.
   - criterion-13-before-select-uplink.png and criterion-13-after-select-uplink.png show CSR changed to Uplink MOS, followed by the launcher in criterion-13-after-return-launcher.png. criterion-13-final.png retains the Uplink selector/legend but still shows map loading. No legacy saved configuration without Colour By was available, and edited legend restoration was not exercised; a complete settled restoration is not proved.
14. **Blocked:** Selecting a Call marker opens its Call detail tab directly when it represents one result, or opens a cluster results tab when it represents multiple results, following the HTTP and Download GIS workflow and existing group-based visibility.
   - criterion-14-initial.png shows the launcher only. No selectable single-result or clustered Call markers were available after the reported points HTTP 500, preventing both detail-opening journeys and visibility checks.
15. **Blocked:** The cluster results table displays MSISDN, Test Result, Start Time, End Time, Test Duration, Call Setup Time, Connection Time, Disconnection Cause Code, LTE Return Time, CSFB Time, MOS Downlink, MOS Uplink, Estimated MOS, Band, Test Technologies, Call End Service, and Call End Serving Cell.
   - criterion-15-initial.png shows the launcher only. The reported Call points HTTP 500 prevented opening a cluster table, so the required columns could not be inspected.
16. **Blocked:** Each available column in the cluster results table can be sorted.
   - criterion-16-initial.png shows the launcher only. The reported Call points HTTP 500 prevented obtaining a populated cluster table needed to verify each column's sort behaviour.
17. **Blocked:** Selecting a cluster row opens a separate Call detail tab for that row's exact PointID and keeps the cluster tab open; reopening or restoring Call and Service tabs retains the relevant time and filter scope.
   - criterion-17-initial.png shows the launcher only. The reported Call points HTTP 500 left no cluster row or stable PointID for exact-result tab selection, cluster retention and time/filter restoration checks.
18. **Blocked:** When a selected result has related service information, its Service Details tab can be opened.
   - criterion-18-initial.png shows the launcher only. No selectable Call result with related service information was obtainable after the reported points HTTP 500; service drill-down could not be exercised.
19. **Failed:** Call technology legends and filters include 2G, 3G, 4G, and 5G SA and exclude 5G NSA.
   - criterion-19-before-configure-call.png directly shows a 5G NSA CSR [%] legend group. criterion-19-final.png shows Configure Automobile - Call with 2G, 3G, 4G, 5G SA and a checked 5G NSA filter. The visible 5G NSA legend and filter contradict the required exclusion.
20. **Blocked:** Requesting details for a selected result with no duration displays a clear no-data message.
   - criterion-20-initial.png shows the launcher only. The reported Call points HTTP 500 prevented identifying and selecting a result without duration, so its requested-detail message could not be checked.
21. **Blocked:** When point or service details cannot be returned, the selected item does not show stale detail data.
   - criterion-21-initial.png shows the launcher only. The reported Call points HTTP 500 prevented establishing a prior successful detail state and then a failed point/service retrieval; stale-detail handling was not exercised.

**Review summary:** Reviewed attempt-002 against all 21 canonical criteria. Call points retrieval was reported to return HTTP 500, blocking data-dependent checks; the unavailable legacy configuration also blocks complete restoration verification. Direct screenshots support the selector/default and MOS legend-shape checks and contradict 5G NSA exclusion.
