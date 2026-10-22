# TEST2-79 Evidence Review

- **Ticket:** TEST2-79 — Map and inspect Automobile Download and Upload results
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-002
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Unverified:** With neither layer selected, the map shows no Download or Upload test-result points.
   - criterion-1-before-configure.png, criterion-1-test-types.png and criterion-1-final.png show Automobile - Ping as the sole selected layer, but do not independently identify every visible marker to establish absence of Download/Upload results.
2. **Passed:** After selecting Download, the map shows selectable points for matching authorised Download results only.
   - criterion-2-before-apply.png selects Download; criterion-2-after-apply.png shows Automobile - Download markers and legend; criterion-2-final.png shows selected Download result 132363237. Recorded /api/platform/automobile/download/points, /cluster-details and /test-analysis requests match this module and current authorised session.
3. **Passed:** After selecting Upload, the map shows selectable points for matching authorised Upload results only.
   - criterion-3-before-apply.png selects Upload; criterion-3-map.png shows Automobile - Upload markers and legend; criterion-3-final.png shows selected Upload result 132363116 with Upload Rate 11.38 Mbps. Recorded /api/platform/automobile/upload/points request matches the tested module and current authorised session.
4. **Unverified:** Selecting a Download result point opens its details dialog with Data Technology, MSISDN, Service, Serving Cell, Test Duration, Test Technologies, Download Rate, and Wi-Fi Connected.
   - criterion-4-map.png and criterion-4-details.png show Download selection and result 132363237 with MSISDN, rate, Serving Cell, Service and Test Technologies; criterion-4-final.png shows Technology and Test Duration 31.147 s, but its Wi-Fi Connected row is clipped above the viewport. Complete coverage of all eight fields remains inconclusive.
5. **Passed:** Selecting an Upload result point opens its details dialog with Data Technology, MSISDN, Service, Serving Cell, Test Duration, Test Technologies, Upload Rate, and Wi-Fi Connected.
   - criterion-5-map.png shows Automobile - Upload; criterion-5-details.png shows selected result 132363116 with MSISDN, Upload Rate 11.38 Mbps, Serving Cell, Service and Test Technologies. criterion-5-final.png shows Wi-Fi Connected No, Technology 5G NSA and Test Duration 0.703 s, completing the requested summary fields across this criterion's own captures.
6. **Passed:** The Download result details chart plots Signal Strength in dBm and Download Rate in Mbps over time.
   - criterion-6-map.png shows Automobile - Download; criterion-6-details.png and criterion-6-final.png show selected Download result 132363237 with Signal strength and Download Rate series, dBm and Mbps axes, and Seconds on the time axis.
7. **Blocked:** The Upload result details chart plots Signal Strength in dBm and Upload Rate in Mbps over time.
   - Browser execution stopped after a wait timeout and stale code-mode host error. criterion-7-before-apply.png shows Upload selected in configuration while the map still shows Ping; no criterion-owned Upload chart or final browserUrl was captured. Testing could not be completed; post-interruption state and restoration require coordinator reconciliation.
8. **Blocked:** The Download details table displays MSISDN, Start Time, End Time, Download Rate, Band, Serving Cell, Service, Test Technologies, Data Technology, Wi-Fi Connected, URL, and Error Message.
   - Browser execution stopped during criterion 7 after a wait timeout and stale code-mode host error. This criterion was not executed; no criterion-owned browser evidence was captured and testing could not be completed. Post-interruption Automobile state and restoration require coordinator reconciliation.
9. **Blocked:** The Upload details table displays MSISDN, Start Time, End Time, Upload Rate, Band, Serving Cell, Service, Test Technologies, Data Technology, Wi-Fi Connected, URL, and Error Message.
   - Browser execution stopped during criterion 7 after a wait timeout and stale code-mode host error. This criterion was not executed; no criterion-owned browser evidence was captured and testing could not be completed. Post-interruption Automobile state and restoration require coordinator reconciliation.
10. **Blocked:** Where signal strength or rate values are shown, each value includes its applicable unit (dBm or Mbps).
   - Browser execution stopped during criterion 7 after a wait timeout and stale code-mode host error. This criterion was not executed; no criterion-owned browser evidence was captured and testing could not be completed. Post-interruption Automobile state and restoration require coordinator reconciliation.
11. **Blocked:** For a result whose Error Message is null, the details table displays “No Error”.
   - Browser execution stopped during criterion 7 after a wait timeout and stale code-mode host error. This criterion was not executed; no criterion-owned browser evidence was captured and testing could not be completed. Post-interruption Automobile state and restoration require coordinator reconciliation.
12. **Blocked:** Sorting a supported Download or Upload details-table column changes the displayed row order to match the selected sort.
   - Browser execution stopped during criterion 7 after a wait timeout and stale code-mode host error. This criterion was not executed; no criterion-owned browser evidence was captured and testing could not be completed. Post-interruption Automobile state and restoration require coordinator reconciliation.
13. **Blocked:** Filtering a supported Download or Upload details-table column displays rows matching the applied filter.
   - Browser execution stopped during criterion 7 after a wait timeout and stale code-mode host error. This criterion was not executed; no criterion-owned browser evidence was captured and testing could not be completed. Post-interruption Automobile state and restoration require coordinator reconciliation.
14. **Blocked:** Requesting details for a zero-duration test does not open a details dialog.
   - Browser execution stopped during criterion 7 after a wait timeout and stale code-mode host error. This criterion was not executed; no criterion-owned browser evidence was captured and testing could not be completed. Post-interruption Automobile state and restoration require coordinator reconciliation.
15. **Blocked:** While result details are loading, the interface shows a loading state without stale or misleading detail data.
   - Browser execution stopped during criterion 7 after a wait timeout and stale code-mode host error. This criterion was not executed; no criterion-owned browser evidence was captured and testing could not be completed. Post-interruption Automobile state and restoration require coordinator reconciliation.
16. **Blocked:** If result details fail to load, the interface shows an error state without stale or misleading detail data.
   - Browser execution stopped during criterion 7 after a wait timeout and stale code-mode host error. This criterion was not executed; no criterion-owned browser evidence was captured and testing could not be completed. Post-interruption Automobile state and restoration require coordinator reconciliation.

**Review summary:** Independent review of cycle-002 attempt-002 Automobile evidence completed; browser execution interruption left criteria 7–16 unavailable for completion.
