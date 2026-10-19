# TEST2-90 Evidence Review

- **Ticket:** TEST2-90 — Map and inspect Automobile call results
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Blocked:** With Automobile Call results available, selecting the Call layer displays the results as selectable map points.
   - criterion-1-final.png shows an Automobile Call legend alongside Surveyor results, without a demonstrated selectable Automobile Call result. The tester reports Call points HTTP 500, blocking the required available-data prerequisite.
2. **Passed:** The shared Colour By selector offers CSR, Downlink MOS, Uplink MOS, and Estimated MOS, with CSR selected by default.
   - criterion-2-before-add-call.png shows a new Call configuration; criterion-2-after-add-call.png shows CSR selected before any metric change. criterion-2-final.png visibly offers CSR, Downlink MOS, Uplink MOS and Estimated MOS.
3. **Blocked:** For each Colour By choice, visible Call markers use that metric's values and the legend shows its matching title, units, categories, and colours; CSR is shown as a percentage and MOS as dimensionless scores.
   - criterion-3-final.png shows the Estimated MOS legend but no Call markers on the map. Reported Call points HTTP 500 prevents verifying metric-specific marker values and colours across all four modes.
4. **Blocked:** Changing Colour By preserves the current date, filters, group visibility, marker identities, and selected result.
   - criterion-4-final.png shows a Call legend without an established selected Call result. Reported Call points HTTP 500 prevents establishing marker identities and selection for the required preservation comparison.
5. **Blocked:** For a marker representing multiple calls, CSR is 100 × successful calls divided by successful, setup-failed, operator-answered, no-service, and invalid calls; dropped calls are excluded and a zero denominator produces zero. Each MOS value is weighted by that metric's own valid sample count, and Estimated MOS uses its dedicated values rather than an average of Downlink and Uplink MOS.
   - criterion-5-final.png shows the CSR legend with other layers present, without an identified multi-call marker or its counts. Reported Call points HTTP 500 leaves CSR denominators and independent MOS weighting unavailable.
6. **Blocked:** The default CSR legend uses green #31AA4F for 95–100%, light green #86BE42 for 90–<95%, yellow #FCBF1A for 85–<90%, red #E61733 for 80–<85%, and dark red #AE1A32 for 0–<80%; exact boundaries use the higher band.
   - criterion-6-final.png shows descending CSR thresholds at 95, 90, 85 and 80 with coloured swatches. Reported Call points HTTP 500 prevents verifying actual classifications at exact boundaries; visible legend labels alone do not establish them.
7. **Blocked:** Each default MOS legend uses dark red #AE1A32 for 1–<2, yellow #FCBF1A for 2–<3, light green #86BE42 for 3–<4, and green #31AA4F for 4–5 inclusive; exact internal boundaries use the higher band.
   - criterion-7-final.png shows Estimated MOS bands including 4 ≤ MOS ≤ 5. Reported Call points HTTP 500 prevents checking actual boundary marker classifications across the three MOS metrics.
8. **Blocked:** When the selected MOS metric has no valid samples, it is unavailable rather than shown as zero or replaced by another metric; values outside its bands use the white, initially hidden Out of Threshold category, with no separate Not Tested category.
   - criterion-8-final.png shows Downlink MOS bands and a hidden white Out of Threshold category. Reported Call points HTTP 500 prevents obtaining missing-sample and out-of-band results to assess unavailable values and substitution.
9. **Unverified:** The CSR legend shows 2G circles, 3G triangles, 4G diamonds, 5G SA pentagons, and a fixed black-square No Service category for generation 0; No Service is separate from CSR percentage bands.
   - criterion-9-after-open-edit-legend.png and criterion-9-final.png show a separate black-square No Service category, 2G circles and 3G triangles. The criterion-owned images do not expose complete 4G and 5G SA generation groups; DOM assertions alone cannot establish the full visual requirement.
10. **Passed:** The MOS legends use squares for Downlink MOS, circles for Uplink MOS, and hexagons for Estimated MOS, grouping by the selected metric.
   - criterion-10-after-downlink-mos.png, criterion-10-after-uplink-mos.png and criterion-10-after-estimated-mos.png visibly show squares, circles and hexagons respectively, with a single matching metric heading in each legend.
11. **Blocked:** Each Call legend includes a fixed white-square Out of Threshold category hidden by default; bands are ordered descending, with CSR limits 0–100 and MOS limits 1–5, and displayed labels match the boundary behaviour.
   - criterion-11-final.png shows descending Estimated MOS bands and a hidden white-square Out of Threshold category. Reported Call points HTTP 500 prevents checking agreement of displayed labels with actual boundary classification; the complete criterion cannot be established from legends alone.
12. **Blocked:** Editing a metric's customisable bands, labels, marker size, or category visibility updates its Call markers and remains specific to that metric and layer instance when Colour By changes; No Service and Out of Threshold definitions cannot be edited.
   - criterion-12-final.png shows the Call legend without an established matching Call marker baseline or completed edit sequence. Reported Call points HTTP 500 blocks marker-update and metric/layer-specific comparison.
13. **Blocked:** Restoring a Call layer or saved GIS view restores its Colour By choice and associated legend settings; a saved configuration without a choice opens with CSR selected.
   - criterion-13-final.png shows CSR selected, without a Call restoration sequence. The tester reports no available legacy saved Call configuration lacking Colour By; this required fallback fixture is unavailable, and a new layer's CSR selection does not prove restoration.
14. **Blocked:** Selecting a Call marker opens its Call detail tab directly when it represents one result, or opens a cluster results tab when it represents multiple results, following the HTTP and Download GIS workflow and existing group-based visibility.
   - criterion-14-final.png displays Surveyor cluster content, without a demonstrated single or clustered Automobile Call selection. Reported Call points HTTP 500 blocks the required Call marker prerequisites.
15. **Blocked:** The cluster results table displays MSISDN, Test Result, Start Time, End Time, Test Duration, Call Setup Time, Connection Time, Disconnection Cause Code, LTE Return Time, CSFB Time, MOS Downlink, MOS Uplink, Estimated MOS, Band, Test Technologies, Call End Service, and Call End Serving Cell.
   - criterion-15-final.png displays a Surveyor table rather than an Automobile Call cluster. Reported Call points HTTP 500 prevents opening the required Call table and inspecting its specified columns.
16. **Blocked:** Each available column in the cluster results table can be sorted.
   - criterion-16-final.png displays a Surveyor table, without a Call cluster table available to sort. Reported Call points HTTP 500 blocks testing each available Call column.
17. **Blocked:** Selecting a cluster row opens a separate Call detail tab for that row's exact PointID and keeps the cluster tab open; reopening or restoring Call and Service tabs retains the relevant time and filter scope.
   - criterion-17-final.png shows Surveyor cluster tabs without a demonstrated Call cluster row or exact PointID-bearing Call detail. Reported Call points HTTP 500 blocks the selection, retained cluster and Call/Service restoration sequence.
18. **Blocked:** When a selected result has related service information, its Service Details tab can be opened.
   - criterion-18-final.png shows Surveyor cluster content without a selected Call result or related Service Details. Reported Call points HTTP 500 prevents establishing the required service-bearing Call result.
19. **Failed:** Call technology legends and filters include 2G, 3G, 4G, and 5G SA and exclude 5G NSA.
   - criterion-19-after-select-call.png establishes Call as the configured test type; criterion-19-final.png visibly includes checked 2G, 3G, 4G, 5G SA and 5G NSA filters. The 5G NSA option directly contradicts the exclusion requirement.
20. **Blocked:** Requesting details for a selected result with no duration displays a clear no-data message.
   - criterion-20-final.png shows Surveyor results without a selected no-duration Call result. Reported Call points HTTP 500 blocks requesting the required result's details and checking its no-data message.
21. **Blocked:** When point or service details cannot be returned, the selected item does not show stale detail data.
   - criterion-21-final.png shows Surveyor results without a demonstrated Call/Service detail baseline followed by an unavailable-detail selection. Reported Call points HTTP 500 blocks establishing the Call results needed to assess stale-data prevention.

**Review summary:** Reviewed all 21 criteria against attempt-001. Call data and legacy restoration prerequisites block completion; screenshots directly confirm the 5G NSA exclusion failure.
