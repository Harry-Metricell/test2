# TEST2-84 Evidence Review

- **Ticket:** TEST2-84 — View Building Details and Floorplans
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-002
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Blocked:** Selecting one Building point opens a separate dashboard for that building once its details load.
   - criterion-1-after-open-gis.png shows a populated GIS catalogue; criterion-1-final.png shows the Building filter with “No layers match this search.” The required Building layer is unavailable in this session. No Building point could be selected to open its dashboard. criterion-1-cleanup.png shows the catalogue restored after clearing the filter.
2. **Blocked:** When multiple Building points are selected at one map location, the user can choose which building dashboard to open.
   - criterion-2-after-open-gis.png shows a populated GIS catalogue; criterion-2-final.png shows the Building filter with “No layers match this search.” The required Building layer is unavailable in this session. Multiple Building points could not be selected to exercise the dashboard chooser. criterion-2-cleanup.png shows the catalogue restored after clearing the filter.
3. **Blocked:** When the selection contains too many Building points to identify a building, the user is prompted to zoom in or apply filters, and no ambiguous building dashboard opens.
   - criterion-3-after-open-gis.png shows a populated GIS catalogue; criterion-3-final.png shows the Building filter with “No layers match this search.” The required Building layer is unavailable in this session. A selection containing too many Building points could not be created to assess the zoom/filter prompt. criterion-3-cleanup.png shows the catalogue restored after clearing the filter.
4. **Blocked:** When building information is available, the dashboard shows building and floorplan summary information in sortable and filterable tables.
   - criterion-4-after-open-gis.png shows a populated GIS catalogue; criterion-4-final.png shows the Building filter with “No layers match this search.” The required Building layer is unavailable in this session. Building and floorplan summary tables could not be reached to assess their data, sorting or filtering. criterion-4-cleanup.png shows the catalogue restored after clearing the filter.
5. **Blocked:** When the building has floorplans, the dashboard displays their images and lets the user select a floorplan.
   - criterion-5-after-open-gis.png shows a populated GIS catalogue; criterion-5-final.png shows the Building filter with “No layers match this search.” The required Building layer is unavailable in this session. A building with floorplans could not be reached to assess images and floorplan selection. criterion-5-cleanup.png shows the catalogue restored after clearing the filter.
6. **Blocked:** Selecting a floorplan displays its image with the associated survey points overlaid.
   - criterion-6-after-open-gis.png shows a populated GIS catalogue; criterion-6-final.png shows the Building filter with “No layers match this search.” The required Building layer is unavailable in this session. No floorplan could be selected to assess its image and survey-point overlay. criterion-6-cleanup.png shows the catalogue restored after clearing the filter.
7. **Blocked:** When the building has no floorplans, the dashboard displays available building details without an empty floorplan image area.
   - criterion-7-after-open-gis.png shows a populated GIS catalogue; criterion-7-final.png shows the Building filter with “No layers match this search.” The required Building layer is unavailable in this session. A building without floorplans could not be reached to assess details and the absence of an empty image area. criterion-7-cleanup.png shows the catalogue restored after clearing the filter.
8. **Blocked:** While Building data is loading, a loading state is displayed.
   - criterion-8-after-open-gis.png shows a populated GIS catalogue; criterion-8-final.png shows the Building filter with “No layers match this search.” The required Building layer is unavailable in this session. No Building data request was triggered, so the Building loading state could not be assessed. criterion-8-cleanup.png shows the catalogue restored after clearing the filter.
9. **Blocked:** When Building data is unavailable, a no-data state is displayed.
   - criterion-9-after-open-gis.png shows a populated GIS catalogue; criterion-9-final.png shows the Building filter with “No layers match this search.” The required Building layer is unavailable in this session. No Building dashboard was reached; the layer-search message does not demonstrate the Building data no-data state. criterion-9-cleanup.png shows the catalogue restored after clearing the filter.
10. **Blocked:** When Building data fails to load, an error state is displayed without incorrect building data.
   - criterion-10-after-open-gis.png shows a populated GIS catalogue; criterion-10-final.png shows the Building filter with “No layers match this search.” The required Building layer is unavailable in this session. No Building data failure was triggered, so its error state and handling of incorrect data could not be assessed. criterion-10-cleanup.png shows the catalogue restored after clearing the filter.

**Review summary:** All ten criteria are blocked by the unavailable Building layer prerequisite. Attempt-002 contains all 40 referenced non-empty PNGs; visual review confirms the loaded catalogue, no Building search matches and restored catalogue. Building dashboard and floorplan assertions could not be exercised; no application defect is established.
