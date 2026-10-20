# TEST2-89 Evidence Review

- **Ticket:** TEST2-89 — Map and inspect MS Teams Call results
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-002
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** Before selecting the MS Teams Call layer, the map shows no MS Teams Call test-result points.
   - criterion-1-after-open-gis.png and criterion-1-before-filter.png show a settled map before layer selection with no MS Teams Call test-result points; criterion-1-final.png shows the map still without those points while the catalogue search returns no matches.
2. **Blocked:** When the user selects the MS Teams Call layer and authorised matching results are available, each matching result is shown as a selectable map point.
   - criterion-2-final.png shows MS Teams searched with No layers match this search. criterion-2-active-layer-options.png lists no MS Teams Call option; criterion-2-call-settings.png shows generic Call settings only. The required layer and matching selectable results were unavailable; availability, deployment or permission cause is undetermined.
3. **Blocked:** For a displayed MS Teams Call point with Poor Quality 0–0.99, its map colour is Green.
   - criterion-3-final.png shows MS Teams search returning No layers match this search. No displayed MS Teams Call point with Poor Quality 0-0.99 was available to assess its Green colour.
4. **Blocked:** For a displayed MS Teams Call point with Poor Quality 1–9.99, its map colour is Yellow.
   - criterion-4-final.png shows MS Teams search returning No layers match this search. No displayed MS Teams Call point with Poor Quality 1-9.99 was available to assess its Yellow colour.
5. **Blocked:** For a displayed MS Teams Call point with Poor Quality 10–24.99, its map colour is Amber.
   - criterion-5-final.png shows MS Teams search returning No layers match this search. No displayed MS Teams Call point with Poor Quality 10-24.99 was available to assess its Amber colour.
6. **Blocked:** For a displayed MS Teams Call point with Poor Quality 25 or greater, its map colour is Red.
   - criterion-6-final.png shows MS Teams search returning No layers match this search. No displayed MS Teams Call point with Poor Quality 25 or greater was available to assess its Red colour.
7. **Blocked:** When the user selects a map point and its details load successfully, the details dialog displays Test ID, Test Result, Connection Time, Call Duration, Poor Quality, MSISDN and Test Technologies.
   - criterion-7-final.png shows MS Teams search returning No layers match this search. A selectable MS Teams Call result and loaded details dialog were unavailable, preventing inspection of Test ID, Test Result, Connection Time, Call Duration, Poor Quality, MSISDN and Test Technologies.
8. **Blocked:** When the user selects a map point and its details load successfully, the details dialog displays signal and download charts and shows handover markers when available.
   - criterion-8-final.png shows MS Teams search returning No layers match this search. A selectable MS Teams Call result and loaded details dialog were unavailable, preventing inspection of signal/download charts and available handover markers.
9. **Blocked:** When the user selects a map point and its details load successfully, the details dialog displays a detailed-sample table that omits label, latitude, longitude and handover-only columns.
   - criterion-9-final.png shows MS Teams search returning No layers match this search. MS Teams Call details and detailed samples were unavailable, preventing inspection of the table and exclusion of label, latitude, longitude and handover-only columns.
10. **Blocked:** When detailed samples are displayed, sorting a supported column changes their displayed order to match the selected sort.
   - criterion-10-final.png shows MS Teams search returning No layers match this search. MS Teams Call detailed samples were unavailable, so no supported column sort or resulting order could be exercised.
11. **Blocked:** When detailed samples are displayed, filtering a supported column limits the displayed samples to those matching the filter.
   - criterion-11-final.png shows MS Teams search returning No layers match this search. MS Teams Call detailed samples were unavailable, so no supported column filter or matching sample subset could be exercised.
12. **Blocked:** When the user exports a selected test as CSV, the exported CSV contains data for that selected test.
   - criterion-12-final.png shows MS Teams search returning No layers match this search. No MS Teams Call test could be selected for CSV export; selected-test CSV contents could not be assessed.
13. **Blocked:** When a zero-duration result is selected, its details dialog does not display stale or misleading data.
   - criterion-13-final.png shows MS Teams search returning No layers match this search. No zero-duration MS Teams Call result was available for selection, preventing assessment of stale or misleading dialog data.
14. **Blocked:** When details for a selected result fail to load, the dialog does not display stale or misleading data.
   - criterion-14-final.png shows MS Teams search returning No layers match this search. No MS Teams Call result was available to exercise a failed detail load, preventing assessment of stale or misleading dialog data.

**Review summary:** Reviewed all 14 criteria against attempt-002 PNG evidence: one Passed and thirteen Blocked by the unavailable MS Teams Call layer and dependent results. All 47 referenced PNGs exist and are non-empty. Identical SHA256 groups were visually inspected through one representative per group; each criterion retains its own referenced evidence. The blocker cause is undetermined; no confirmed application defect is established.
