# TEST2-79 Evidence Review

- **Ticket:** TEST2-79 — Map and inspect Automobile Download and Upload results
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With neither layer selected, the map shows no Download or Upload test-result points.
   - criterion-1-after-open-gis.png and criterion-1-final.png show the settled unobscured map with no selected layers and no Download/Upload test-result points in the visible viewport; the map remained empty of these points.
2. **Blocked:** After selecting Download, the map shows selectable points for matching authorised Download results only.
   - criterion-2-before-add-download.png shows Download selected; criterion-2-final.png shows its layer and legend without established matching selectable results. The run records HTTP 500 from the Download points endpoint, leaving required authorised data unavailable; this does not establish an empty dataset.
3. **Blocked:** After selecting Upload, the map shows selectable points for matching authorised Upload results only.
   - criterion-3-before-add.png and criterion-3-final.png show Upload selected alongside unrelated Surveyor layers. The run records HTTP 500 from the Upload points endpoint, leaving matching authorised selectable results unavailable. Visible Surveyor points do not verify Upload results.
4. **Blocked:** Selecting a Download result point opens its details dialog with Data Technology, MSISDN, Service, Serving Cell, Test Duration, Test Technologies, Download Rate, and Wi-Fi Connected.
   - criterion-4-final.png shows the Download layer and unrelated layers, without a Download result details dialog. The recorded Download points HTTP 500 prevented selection of a required result, so the summary fields could not be tested.
5. **Blocked:** Selecting an Upload result point opens its details dialog with Data Technology, MSISDN, Service, Serving Cell, Test Duration, Test Technologies, Upload Rate, and Wi-Fi Connected.
   - criterion-5-final.png shows the Upload layer and unrelated layers, without an Upload result details dialog. The recorded Upload points HTTP 500 prevented selection of a required result, so the summary fields could not be tested.
6. **Blocked:** The Download result details chart plots Signal Strength in dBm and Download Rate in Mbps over time.
   - criterion-6-final.png shows a Surveyor Call chart, not Download details. The recorded Download points HTTP 500 prevented opening the required Download chart; its signal/rate series, units and time axis could not be tested.
7. **Blocked:** The Upload result details chart plots Signal Strength in dBm and Upload Rate in Mbps over time.
   - criterion-7-final.png shows a Surveyor Call chart, not Upload details. The recorded Upload points HTTP 500 prevented opening the required Upload chart; its signal/rate series, units and time axis could not be tested.
8. **Blocked:** The Download details table displays MSISDN, Start Time, End Time, Download Rate, Band, Serving Cell, Service, Test Technologies, Data Technology, Wi-Fi Connected, URL, and Error Message.
   - criterion-8-final.png shows unrelated Surveyor Call details and the Download layer legend, not a Download details table. The recorded Download points HTTP 500 prevented reaching the required table and checking its columns.
9. **Blocked:** The Upload details table displays MSISDN, Start Time, End Time, Upload Rate, Band, Serving Cell, Service, Test Technologies, Data Technology, Wi-Fi Connected, URL, and Error Message.
   - criterion-9-final.png shows unrelated Surveyor Call details and the Upload layer legend, not an Upload details table. The recorded Upload points HTTP 500 prevented reaching the required table and checking its columns.
10. **Blocked:** Where signal strength or rate values are shown, each value includes its applicable unit (dBm or Mbps).
   - criterion-10-final.png shows legend units and a Surveyor upload table; neither verifies Automobile result values. The recorded Download points HTTP 500 prevented accessing the required signal/rate values and checking their units.
11. **Blocked:** For a result whose Error Message is null, the details table displays “No Error”.
   - criterion-11-final.png shows a Surveyor table, not an Automobile result with a known null Error Message. The recorded Download points HTTP 500 left that required fixture unavailable, so No Error rendering could not be tested.
12. **Blocked:** Sorting a supported Download or Upload details-table column changes the displayed row order to match the selected sort.
   - criterion-12-final.png shows a Surveyor table without a criterion-owned Automobile sorting sequence. The recorded Download points HTTP 500 prevented reaching a populated Automobile details table and exercising sorting.
13. **Blocked:** Filtering a supported Download or Upload details-table column displays rows matching the applied filter.
   - criterion-13-final.png shows a Surveyor table without a criterion-owned Automobile filter sequence. The recorded Download points HTTP 500 prevented reaching the required Automobile details table and exercising filtering.
14. **Blocked:** Requesting details for a zero-duration test does not open a details dialog.
   - criterion-14-final.png shows unrelated Surveyor data, not an identified zero-duration Automobile result. The recorded Download points HTTP 500 left the required fixture unavailable; no zero-duration details request was made.
15. **Blocked:** While result details are loading, the interface shows a loading state without stale or misleading detail data.
   - criterion-15-final.png shows an unrelated Surveyor table, not an Automobile details loading transition. The recorded Download points HTTP 500 prevented initiating a point-details request, so loading and stale-data handling could not be tested.
16. **Blocked:** If result details fail to load, the interface shows an error state without stale or misleading detail data.
   - criterion-16-final.png shows an unrelated Surveyor table, not an Automobile details failure state. The recorded HTTP 500 concerns the Download points endpoint and prevented a details request; it does not demonstrate details error or stale-data behavior.

**Review summary:** Assessment completed against all 16 canonical criteria and attempt-001 evidence. Required Automobile data was unavailable: the run records repeated Download/Upload points HTTP 500 responses. Unrelated Surveyor layers and panels do not verify Automobile behavior; criterion 3 cleanup did not restore the unrelated selections. All 108 referenced PNGs exist and are non-empty.
