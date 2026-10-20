# TEST2-81 Evidence Review

- **Ticket:** TEST2-81 — Map HTTP Browsing, Ping and Video Streaming point details
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-002
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Blocked:** Given HTTP Browsing results are available, when the HTTP Browsing layer is selected, each supplied result is displayed as a selectable point on the map.
   - criterion-1-after-layer.png shows HTTP Browsing markers; criterion-1-after-location-search.png shows clustered results. criterion-1-final.png shows 'Unable to load point details', consistent with the reported cluster-details HTTP 500 blocker. Individual-result access and correspondence for each supplied result remain blocked.
2. **Blocked:** Given Ping results are available, when the Ping layer is selected, each supplied result is displayed as a selectable point on the map.
   - criterion-2-after-select-ping.png and criterion-2-after-add-layer.png show Ping selected and markers rendered. criterion-2-final.png shows 'Unable to load point details'; the reported Ping cluster-details HTTP 500 prevents verifying each supplied individual result's selectability.
3. **Unverified:** Given Video Streaming results are available, when the Video Streaming layer is selected, each supplied result is displayed as a selectable point on the map.
   - criterion-3-after-add-layer.png shows the Video Streaming layer without identifiable result points. criterion-3-after-widen-area.png is an unsettled map view; criterion-3-final.png has settled labels but still does not establish an identifiable selectable result. The reported aggregate response alone does not prove individual rendering or selectability.
4. **Unverified:** Given details are available for a result point, when the point is selected, a new detail dialog opens for that same result and displays its test type, result time, location, and available network technology/context.
   - criterion-4-after-coordinate-search.png and criterion-4-after-return-aggregate-zoom.png show markers and a search pin but no point-detail dialog. criterion-4-after-individual-zoom.png has an unsettled blank basemap; criterion-4-final.png shows GIS after reload with the layer removed. The reported intercepted click and configuration timeout do not establish successful selection of an individual result or an application defect; same-result identity and common context remain unverified.
5. **Blocked:** Given an HTTP Browsing point is selected and its details are available, the dialog displays that result’s Page Load Time.
   - criterion-5-after-open-config.png and criterion-5-final.png show HTTP Browsing configuration only. No selected individual result or Page Load Time detail was obtainable; the run stopped at the reported individual-detail service HTTP 500 dependency.
6. **Blocked:** Given a Ping point is selected and its details are available, the dialog displays that result’s Ping Time.
   - criterion-6-after-select-ping.png and criterion-6-final.png show Ping configuration only. No selected individual result or Ping Time detail was obtainable; the run stopped at the reported Ping individual-detail service HTTP 500 dependency.
7. **Blocked:** Given a Video Streaming point is selected and its details are available, the dialog displays that result’s Rebuffer Count.
   - criterion-7-after-select-video.png shows Video Streaming selected. criterion-7-final.png shows 'Unable to load point details' without a result KPI, consistent with the reported video-streaming cluster-details HTTP 500. The service blocker prevents verifying an individual result's Rebuffer Count.
8. **Blocked:** Given an HTTP Browsing result ends in error, when its point is displayed, it is visually distinct from a successful result; a zero Page Load Time on the failed result is not coloured as success.
   - criterion-8-after-add-http.png and criterion-8-final.png show black Error symbols distinct from coloured Load Time symbols. The results report no identifiable failed individual HTTP result with zero Page Load Time was available; the legend and aggregate map cannot establish that required failed-zero case.
9. **Unverified:** Given details cannot be returned for a selected point, the user sees a clear no-data or error message and no stale details are displayed.
   - criterion-9-after-add-http-baseline.png shows no detail panel; criterion-9-after-error.png and criterion-9-final.png show 'Unable to load point details' with Retry and no detail values. This supports a clear aggregate error from an empty baseline, but selection was an aggregate rather than an identified individual point, so the required individual-point error behavior remains unverified.

**Review summary:** Reviewed all nine canonical criteria against the 57 referenced attempt-002 PNGs. Individual-detail service dependencies and the unavailable failed-zero fixture block completion; aggregate-only or inconclusive interaction evidence remains Unverified.
