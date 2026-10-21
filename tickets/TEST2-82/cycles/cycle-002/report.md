# TEST2-82 Evidence Review

- **Ticket:** TEST2-82 — Display Ping Point Details
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** When a selected Ping point’s details have loaded, the detail view shows that point’s Ping Time with the unit milliseconds (ms).
   - criterion-1-cluster-before-point.png identifies the selected event at 21/09/2026 11:47:36 with 14 ms; criterion-1-final.png shows the matching loaded detail view with Ping Time 14 ms.
2. **Passed:** When Ping attributes are returned for the selected point, the detail view displays those attributes alongside the Ping Time.
   - criterion-2-final.png shows the selected event at 21/09/2026 11:47:36 with Ping Time 14 ms alongside Jitter 9 ms, Cell ID, Wi-Fi technology, Wi-Fi Connected True and Band LTE 2100.
3. **Passed:** With 5G NSA as the only selected technology, opening a Ping point displays details for that selected point without an error state.
   - criterion-3-tech-toggle-6.png and criterion-3-nsa-only-before-add.png show only 5G NSA selected. criterion-3-cluster-before-point.png identifies the 06/10/2026 10:31:30 event; criterion-3-final.png shows its loaded details, Ping Time 23 ms, Jitter 3 ms and Data Technology 5G NSA without a detail-load error.
4. **Passed:** While Ping details are loading, the detail view shows a loading state.
   - SIMULATED UI STATE: held the original POST https://o2intelligence-v4-dev.metricell.com/api/platform/surveyor/ping/event-analysis for pointId 9531501 / mercatorKey 1513490457731707874 after observing its genuine successful request/response; other methods/records fell through and no response body was fabricated. criterion-4-genuine-point-baseline.png shows the loaded target at 11:47:36 / 14 ms; criterion-4-before-held-reopen.png shows its closed detail tab; criterion-4-final.png shows Analysis Loading... and a progress bar for the same target. criterion-4-recovery.png shows genuine recovery after release; results record owned-handler removal in finally and criterion-4-cleanup.png shows test tabs/layer removed. This proves this endpoint's Analysis loading UI only, not backend performance or loading of every detail panel.
5. **Blocked:** When Ping details are unavailable, the detail view shows a no-data state.
   - No unavailable Ping-detail fixture or authoritative empty-detail response contract was available. criterion-5-final.png shows populated selected-point details with Ping Time 14 ms; No neighbours are available is not a no-data state for Ping details. The unavailable-details state could not be exercised; a known unavailable event or documented empty-detail contract is required.
6. **Passed:** When Ping details fail to load, the detail view shows an error state and does not display data as if it belonged to the selected point.
   - SIMULATED UI STATE: one exact-target POST https://o2intelligence-v4-dev.metricell.com/api/platform/surveyor/ping/event-analysis for pointId 9531501 / mercatorKey 1513490457731707874 received HTTP 500 text/plain Internal Server Error after the genuine successful request established the endpoint; other methods/records fell through. criterion-6-genuine-target-baseline.png shows target 11:47:36 / 14 ms; criterion-6-before-distinct-point.png, criterion-6-distinct-valid-point.png and criterion-6-before-failed-target.png establish the intervening distinct event at 11:47:35 / 13 ms and its closure. criterion-6-final.png shows Unable to load details. and Retry with the target's own 11:47:36 / 14 ms summary and no prior event analysis. Results record exact-handler removal in finally; criterion-6-recovery.png shows genuine Retry recovery and criterion-6-cleanup.png shows test tabs/layer removed. This proves synthetic Analysis endpoint error handling and stale-data exclusion, not a naturally occurring backend failure or failure of every detail panel.

**Review summary:** Completed evidence assessment for cycle-002 attempt-001; unavailable-details verification requires an unavailable fixture or authoritative empty-response contract.
