# TEST2-79 Evidence Review

- **Ticket:** TEST2-79 — Map and inspect Automobile Download and Upload results
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)
- **Editable report:** [Download Word (.docx)](report.docx)

## Criterion results

1. **Passed:** With neither layer selected, the map shows no Download or Upload test-result points.
   - criterion-1-baseline-map.png and criterion-1-final.png show the settled Automobile - Ping selection, Ping legend and displayed Ping results, with neither Download nor Upload layer selected; criterion-1-test-types.png confirms these are distinct nested Automobile choices. No Download or Upload result presentation is visible in this scope.
2. **Unverified:** After selecting Download, the map shows selectable points for matching authorised Download results only.
   - criterion-2-after-apply.png shows Automobile - Download points and legend; criterion-2-final.png shows selectable Download aggregate rows 132614267 and 132610842. Complete supplied map-record/cluster-member reconciliation and authorisation comparison are absent, so matching-only scope and selectability of all results remain unverified.
3. **Unverified:** After selecting Upload, the map shows selectable points for matching authorised Upload results only.
   - criterion-3-after-apply.png shows Automobile - Upload points and legend; criterion-3-final.png shows selected Upload test 132045835. Complete supplied map-record/cluster-member reconciliation and authorisation comparison are absent, so matching-only scope and selectability of all results remain unverified.
4. **Passed:** Selecting a Download result point opens its details dialog with Data Technology, MSISDN, Service, Serving Cell, Test Duration, Test Technologies, Download Rate, and Wi-Fi Connected.
   - criterion-4-detail-top.png shows Download test 132614267 with MSISDN 447925375897, Download Rate 22.37 Mbps, Serving Cell 11318_122_4 and Service 4G; criterion-4-detail-middle.png shows Test Technologies 4G, Data Technology 4G and Wi-Fi Connected No; criterion-4-final.png shows Test Duration 30.276 s. All eight required fields are readable in the selected Automobile Download detail.
5. **Passed:** Selecting an Upload result point opens its details dialog with Data Technology, MSISDN, Service, Serving Cell, Test Duration, Test Technologies, Upload Rate, and Wi-Fi Connected.
   - criterion-5-detail-top.png shows Upload test 132045835 with MSISDN 447925375897, Upload Rate 3.21 Mbps, Serving Cell 105_115_4 and Service 5G NSA; criterion-5-detail-middle.png shows Test Technologies 4G, Data Technology 5G NSA and Wi-Fi Connected No; criterion-5-final.png shows Test Duration 2.582 s. All eight required fields are readable in the selected Automobile Upload detail.
6. **Passed:** The Download result details chart plots Signal Strength in dBm and Download Rate in Mbps over time.
   - criterion-6-final.png shows the settled Automobile Download detail for 132614267 with cyan Signal strength and magenta Download Rate series, left axis dBm, right axis Mbps and horizontal axis Seconds.
7. **Passed:** The Upload result details chart plots Signal Strength in dBm and Upload Rate in Mbps over time.
   - criterion-7-final.png shows the settled Automobile Upload detail for 132045835 with cyan Signal strength and magenta Upload Rate series, left axis dBm, right axis Mbps and horizontal axis Seconds. Subsequent cleanup was not verified after the reported execution-host timeout; the Upload selection/detail remained open alongside the original Ping detail, with no synthetic handlers reported.
8. **Blocked:** The Download details table displays MSISDN, Start Time, End Time, Download Rate, Band, Serving Cell, Service, Test Technologies, Data Technology, Wi-Fi Connected, URL, and Error Message.
   - Testing could not be completed after the execution host timed out waiting for a wait response. Browser ownership/state required coordinator reconciliation; no criterion-specific browser evidence was captured. This capability interruption does not establish a product defect.
9. **Blocked:** The Upload details table displays MSISDN, Start Time, End Time, Upload Rate, Band, Serving Cell, Service, Test Technologies, Data Technology, Wi-Fi Connected, URL, and Error Message.
   - Testing could not be completed after the execution host timed out waiting for a wait response. Browser ownership/state required coordinator reconciliation; no criterion-specific browser evidence was captured. This capability interruption does not establish a product defect.
10. **Blocked:** Where signal strength or rate values are shown, each value includes its applicable unit (dBm or Mbps).
   - Testing could not be completed after the execution host timed out waiting for a wait response. Browser ownership/state required coordinator reconciliation; no criterion-specific browser evidence was captured. This capability interruption does not establish a product defect.
11. **Blocked:** For a result whose Error Message is null, the details table displays “No Error”.
   - Testing could not be completed after the execution host timed out waiting for a wait response. Browser ownership/state required coordinator reconciliation; no criterion-specific browser evidence was captured. This capability interruption does not establish a product defect.
12. **Blocked:** Sorting a supported Download or Upload details-table column changes the displayed row order to match the selected sort.
   - Testing could not be completed after the execution host timed out waiting for a wait response. Browser ownership/state required coordinator reconciliation; no criterion-specific browser evidence was captured. This capability interruption does not establish a product defect.
13. **Blocked:** Filtering a supported Download or Upload details-table column displays rows matching the applied filter.
   - Testing could not be completed after the execution host timed out waiting for a wait response. Browser ownership/state required coordinator reconciliation; no criterion-specific browser evidence was captured. This capability interruption does not establish a product defect.
14. **Blocked:** Requesting details for a zero-duration test does not open a details dialog.
   - Testing could not be completed after the execution host timed out waiting for a wait response. Browser ownership/state required coordinator reconciliation; no criterion-specific browser evidence was captured. This capability interruption does not establish a product defect.
15. **Blocked:** While result details are loading, the interface shows a loading state without stale or misleading detail data.
   - Testing could not be completed after the execution host timed out waiting for a wait response. Browser ownership/state required coordinator reconciliation; no criterion-specific browser evidence was captured. This capability interruption does not establish a product defect.
16. **Blocked:** If result details fail to load, the interface shows an error state without stale or misleading detail data.
   - Testing could not be completed after the execution host timed out waiting for a wait response. Browser ownership/state required coordinator reconciliation; no criterion-specific browser evidence was captured. This capability interruption does not establish a product defect.

**Review summary:** Independent review of cycle-003 attempt-001: Automobile scope confirmed by nested configuration, visible layer/detail identities and reported Automobile request paths. Map-wide matching/authorisation and complete selectability remain unverified. Criteria 8–16 have no browser evidence because of the reported execution-host interruption; cleanup after criterion 7 remains unverified.
