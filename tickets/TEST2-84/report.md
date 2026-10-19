# TEST2-84 Evidence Review

- **Ticket:** TEST2-84 — View Building Details and Floorplans
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Blocked:** Selecting one Building point opens a separate dashboard for that building once its details load.
   - criterion-1-after-open-gis.png shows an available GIS catalogue; criterion-1-after-filter-building.png and criterion-1-final.png show Building entered with 'No layers match this search.' A selectable single Building point was unavailable, so opening its separate dashboard could not be tested. This prerequisite blocker does not establish an application defect.
2. **Blocked:** When multiple Building points are selected at one map location, the user can choose which building dashboard to open.
   - criterion-2-after-open-gis.png shows an available GIS catalogue; criterion-2-after-filter-building.png and criterion-2-final.png show Building entered with 'No layers match this search.' Multiple Building points at one location were unavailable, so the building chooser could not be tested. This prerequisite blocker does not establish an application defect.
3. **Blocked:** When the selection contains too many Building points to identify a building, the user is prompted to zoom in or apply filters, and no ambiguous building dashboard opens.
   - criterion-3-after-open-gis.png shows an available GIS catalogue; criterion-3-after-filter-building.png and criterion-3-final.png show Building entered with 'No layers match this search.' A large Building-point selection was unavailable, so the zoom/filter prompt and dashboard suppression could not be tested. This prerequisite blocker does not establish an application defect.
4. **Blocked:** When building information is available, the dashboard shows building and floorplan summary information in sortable and filterable tables.
   - criterion-4-after-open-gis.png shows an available GIS catalogue; criterion-4-after-filter-building.png and criterion-4-final.png show Building entered with 'No layers match this search.' A Building dashboard was inaccessible, so building/floorplan summaries, sorting and filtering could not be tested; the visible Network Information panel is unrelated. This prerequisite blocker does not establish an application defect.
5. **Blocked:** When the building has floorplans, the dashboard displays their images and lets the user select a floorplan.
   - criterion-5-after-open-gis.png shows an available GIS catalogue; criterion-5-after-filter-building.png and criterion-5-final.png show Building entered with 'No layers match this search.' A building with floorplans was inaccessible, so floorplan images and selection could not be tested. This prerequisite blocker does not establish an application defect.
6. **Blocked:** Selecting a floorplan displays its image with the associated survey points overlaid.
   - criterion-6-after-open-gis.png shows an available GIS catalogue; criterion-6-after-filter-building.png and criterion-6-final.png show Building entered with 'No layers match this search.' A selectable Building floorplan was unavailable, so its image and associated survey-point overlay could not be tested. This prerequisite blocker does not establish an application defect.
7. **Blocked:** When the building has no floorplans, the dashboard displays available building details without an empty floorplan image area.
   - criterion-7-after-open-gis.png shows an available GIS catalogue; criterion-7-after-filter-building.png and criterion-7-final.png show Building entered with 'No layers match this search.' A building without floorplans was inaccessible, so its details and omission of an empty image area could not be tested. This prerequisite blocker does not establish an application defect.
8. **Blocked:** While Building data is loading, a loading state is displayed.
   - criterion-8-after-open-gis.png shows an available GIS catalogue; criterion-8-after-filter-building.png and criterion-8-final.png show Building entered with 'No layers match this search.' No Building data request could be initiated, so its loading state could not be tested; the visible Surveyor table is unrelated. This prerequisite blocker does not establish an application defect.
9. **Blocked:** When Building data is unavailable, a no-data state is displayed.
   - criterion-9-after-open-gis.png shows an available GIS catalogue; criterion-9-after-filter-building.png and criterion-9-final.png show Building entered with 'No layers match this search.' No Building-specific unavailable-data scenario could be reached, so the required no-data state could not be tested; catalogue search emptiness is not that state. This prerequisite blocker does not establish an application defect.
10. **Blocked:** When Building data fails to load, an error state is displayed without incorrect building data.
   - criterion-10-after-open-gis.png shows an available GIS catalogue; criterion-10-after-filter-building.png and criterion-10-final.png show Building entered with 'No layers match this search.' No Building data load could be initiated, so its error state and protection against incorrect building data could not be tested; the Automobile legend's Error category is unrelated. This prerequisite blocker does not establish an application defect.

**Review summary:** All 10 criteria are blocked by the unavailable Building layer in the accessible GIS catalogue. Browser screenshots were captured, but Building-specific testing could not be completed; permissions and feature/data availability cannot be distinguished from this evidence.
