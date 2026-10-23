# TEST2-89 Evidence Review

- **Ticket:** TEST2-89 — Map and inspect MS Teams Call results
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)
- **Editable report:** [Download Word (.docx)](report.docx)

## Criterion results

1. **Passed:** Before selecting the MS Teams Call layer, the map shows no MS Teams Call test-result points.
   - criterion-1-before-configure.png and criterion-1-final.png show the sole active layer Automobile - Ping, its Ping legend and Ping test 131926379; no MS Teams Call points are displayed. criterion-1-choices.png shows MS Teams Call as a separate nested Automobile test type, still unselected.
2. **Blocked:** When the user selects the MS Teams Call layer and authorised matching results are available, each matching result is shown as a selectable map point.
   - criterion-2-before-apply.png shows MS Teams Call selected in Automobile configuration; criterion-2-final.png shows the applied Automobile - MS Teams Call layer and no plotted results. Tester records GET /api/platform/automobile/ms-teams-call/points returning HTTP 200 with [] for the Cambridge/St Neots/Bedford/Sandy viewport and 24 July–22 October 2026 filters. No matching record was available to exercise each-result selection or reconcile populated points/cluster members; availability outside this scope is unknown.
3. **Blocked:** For a displayed MS Teams Call point with Poor Quality 0–0.99, its map colour is Green.
   - criterion-3-final.png shows the Automobile - MS Teams Call layer without plotted results. Tester records HTTP 200 with [] in the inspected Cambridge-area viewport and 24 July–22 October 2026 filters. No known Poor Quality 0–0.99 result is available to verify Green on an actual map point; the legend alone does not establish the criterion.
4. **Blocked:** For a displayed MS Teams Call point with Poor Quality 1–9.99, its map colour is Yellow.
   - criterion-4-final.png shows the Automobile - MS Teams Call layer without plotted results. Tester records HTTP 200 with [] in the inspected Cambridge-area viewport and 24 July–22 October 2026 filters. No known Poor Quality 1–9.99 result is available to verify Yellow on an actual map point; the legend alone does not establish the criterion.
5. **Blocked:** For a displayed MS Teams Call point with Poor Quality 10–24.99, its map colour is Amber.
   - criterion-5-final.png shows the Automobile - MS Teams Call layer without plotted results. Tester records HTTP 200 with [] in the inspected Cambridge-area viewport and 24 July–22 October 2026 filters. No known Poor Quality 10–24.99 result is available to verify Amber on an actual map point; the legend alone does not establish the criterion.
6. **Blocked:** For a displayed MS Teams Call point with Poor Quality 25 or greater, its map colour is Red.
   - criterion-6-final.png shows the Automobile - MS Teams Call layer without plotted results. Tester records HTTP 200 with [] in the inspected Cambridge-area viewport and 24 July–22 October 2026 filters. No known Poor Quality 25 or greater result is available to verify Red on an actual map point; the legend alone does not establish the criterion.
7. **Blocked:** When the user selects a map point and its details load successfully, the details dialog displays Test ID, Test Result, Connection Time, Call Duration, Poor Quality, MSISDN and Test Technologies.
   - criterion-7-final.png shows the selected Automobile - MS Teams Call layer without results; the open detail tab is explicitly the pre-existing Ping test 131926379. With no matching MS Teams record in the reported empty response, none of the seven required MS Teams summary fields could be checked.
8. **Blocked:** When the user selects a map point and its details load successfully, the details dialog displays signal and download charts and shows handover markers when available.
   - criterion-8-final.png shows Automobile - MS Teams Call without results and an unrelated original Ping tab. The reported empty matching dataset prevents opening MS Teams details to assess signal/download charts and available handover markers.
9. **Blocked:** When the user selects a map point and its details load successfully, the details dialog displays a detailed-sample table that omits label, latitude, longitude and handover-only columns.
   - criterion-9-final.png shows Automobile - MS Teams Call without results and an unrelated Ping tab. No matching MS Teams detail/sample table was available, so table presence and omission of label, latitude, longitude and handover-only columns remain blocked.
10. **Blocked:** When detailed samples are displayed, sorting a supported column changes their displayed order to match the selected sort.
   - criterion-10-final.png shows Automobile - MS Teams Call without results; the reported empty matching dataset provides no detailed samples with differing values for a supported-column sort and ordering comparison.
11. **Blocked:** When detailed samples are displayed, filtering a supported column limits the displayed samples to those matching the filter.
   - criterion-11-final.png shows Automobile - MS Teams Call without results; the reported empty matching dataset provides no detailed samples for a supported-column filter and reconciliation of matching rows.
12. **Blocked:** When the user exports a selected test as CSV, the exported CSV contains data for that selected test.
   - criterion-12-final.png shows Automobile - MS Teams Call without results and the original Ping tab. No matching MS Teams record was available to select/export; no CSV or selected-test data comparison was produced.
13. **Blocked:** When a zero-duration result is selected, its details dialog does not display stale or misleading data.
   - criterion-13-final.png shows Automobile - MS Teams Call without results and the original Ping tab. No zero-duration MS Teams record or distinct valid MS Teams baseline was available; absence of stale/misleading details was not exercised.
14. **Blocked:** When details for a selected result fail to load, the dialog does not display stale or misleading data.
   - criterion-14-final.png shows Automobile - MS Teams Call without results and the original Ping tab. No real MS Teams record/detail request or distinct valid MS Teams baseline was available to exercise failed-detail behaviour, misleading/stale-data comparisons or recovery. No simulation was installed.

**Review summary:** Reviewed all 14 canonical criteria against cycle-002 attempt-001. Criterion 1 has direct visual proof. Criteria 2–14 require matching Automobile MS Teams Call records unavailable in the inspected viewport/time/filter scope. Screenshots show the correct selected module/layer with no plotted results; tester reports the corresponding Automobile points endpoint returned HTTP 200 with []. The endpoint/response itself is not visible in the supplied screenshots, so the retained request coverage assertion is Unverified. All 122 referenced PNGs exist and are non-empty. No current product defect or out-of-scope data availability is established.
