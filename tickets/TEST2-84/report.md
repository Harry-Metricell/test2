# TEST2-84 Evidence Review

- **Ticket:** TEST2-84 — View Building Details and Floorplans
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Blocked:** Selecting one Building point opens a separate dashboard for that building once its details load.
   - criterion-1-single-building-filter.png and criterion-1-single-building-map.png show met2 filtering and a single point; criterion-1-single-building-loading.png opens Building details - met2, but criterion-1-final.png shows Building overview could not be loaded. The reported repeated overview HTTP 500 prevents verification after details load.
2. **Passed:** When multiple Building points are selected at one map location, the user can choose which building dashboard to open.
   - criterion-2-after-point-selection.png shows a five-point cluster with five named building choices. criterion-2-chosen-building-dashboard.png and criterion-2-final.png show the separate Building details - met2 dashboard after choosing met2. The final capture is still loading; this proves choice and dashboard opening only, not successful detail retrieval.
3. **Blocked:** When the selection contains too many Building points to identify a building, the user is prompted to zoom in or apply filters, and no ambiguous building dashboard opens.
   - criterion-3-final.png shows five named choices for the available cluster, not a too-many-points prompt. The tester could not establish a fixture or threshold exceeding that selection limit, so the required branch remains unavailable.
4. **Blocked:** When building information is available, the dashboard shows building and floorplan summary information in sortable and filterable tables.
   - criterion-4-final.png reaches the Building selection menu but contains no summary tables. The tester reports the repeated overview HTTP 500 established in criterion 1 and stopped this dependent check; available building information and sortable/filterable building and floorplan tables could not be tested.
5. **Blocked:** When the building has floorplans, the dashboard displays their images and lets the user select a floorplan.
   - criterion-5-after-point-selection.png shows the met2 dashboard loading; criterion-5-floor-loading.png and criterion-5-final.png already show No floor plans are available for this Building result, not a floor-loading state. No retrievable populated-floorplan fixture was established, so images and floorplan selection remain blocked.
6. **Blocked:** Selecting a floorplan displays its image with the associated survey points overlaid.
   - criterion-6-final.png reaches only the Building choices. The tester could not establish a retrievable floorplan fixture; no floorplan image, selection or associated survey-point overlay is demonstrated.
7. **Blocked:** When the building has no floorplans, the dashboard displays available building details without an empty floorplan image area.
   - criterion-7-final.png reaches only the Building choices. No verified building with both no floorplans and available details was established; the met2 overview service failure prevents checking available details and the required absence of an empty floorplan image area.
8. **Passed:** While Building data is loading, a loading state is displayed.
   - criterion-8-building-config.png selects Surveyor > Building filtered to met2; criterion-8-building-map.png shows its single point. criterion-8-after-point-selection.png and criterion-8-final.png directly show Loading building overview... with a spinner in Building details - met2 during the reported genuine read. Successful retrieval is outside this loading assertion.
9. **Blocked:** When Building data is unavailable, a no-data state is displayed.
   - criterion-9-final.png shows populated Building choices, not settled unavailable overview data. No authentic no-data fixture or authoritative empty overview contract was established; the reported HTTP 500 is an error rather than an empty response, so the no-data branch remains blocked.
10. **Passed:** When Building data fails to load, an error state is displayed without incorrect building data.
   - criterion-10-after-point-selection.png shows the selected met2 overview loading; criterion-10-final.png shows Building overview could not be loaded with no building tables, floorplan images or incorrect record details in the content area. This supports the visible error state for the reported real overview HTTP 500; no simulated response or cross-record stale-data scenario is claimed.

**Review summary:** Independent review of cycle-002 attempt-001 completed against the canonical ten-item checklist and verified Surveyor > Building context. All 88 referenced PNGs exist and are non-empty. Three visible UI assertions are supported; seven criteria remain blocked by the overview-service failure or unavailable prerequisite fixtures/contracts.
