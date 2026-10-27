# TEST2-80 Evidence Review

- **Ticket:** TEST2-80 — Map and inspect Automobile Service results
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** The map layer selector includes Service as a selectable layer.
   - criterion-1-types-before-service.png visibly lists Service; criterion-1-final.png shows Service selected in the Automobile dialog with Add layer available.
2. **Passed:** With Service unselected, the map displays no Service test-result points.
   - criterion-2-map-service-unselected.png and criterion-2-final.png show the settled map with Automobile unselected and no Service result points on the displayed viewport.
3. **Blocked:** When the user selects Service and matching authorised results are available, each matching result is displayed as a selectable map point.
   - criterion-3-final.png shows Automobile - Service selected but no visible Service result points. The recorded Service points HTTP 500 prevents establishing matching authorised results; absence of points does not prove empty data or a defect.
4. **Blocked:** When the user selects a Service result point and its details load successfully, a Service details dialog displays MSISDN, Test Time, Signal, Band, Service, Data Technology, PLMN and Serving Cell.
   - criterion-4-final.png shows Service selected alongside Surveyor - Download, with a Surveyor cluster table rather than Service details. The recorded Service points HTTP 500 blocks opening a Service result and checking the required fields.
5. **Blocked:** With the Service details table displayed, sorting a supported column reorders the displayed rows according to that column.
   - criterion-5-final.png shows a Surveyor cluster table, not the required Service details table. The recorded Service points HTTP 500 blocks reaching Service details; Service-column sorting was not exercised.
6. **Blocked:** With the Service details table displayed, filtering a supported column limits the displayed rows to those matching the filter.
   - criterion-6-final.png shows Service selected without a Service details table. The recorded Service points HTTP 500 blocks reaching that table and exercising its column filters.
7. **Blocked:** When returned details include cell-neighbour data, the dialog displays each neighbour in its own labelled details table.
   - criterion-7-final.png shows Automobile - HTTP Browsing alongside Service and an HTTP Browsing test-information panel, not Service neighbour details. The recorded Service points HTTP 500 blocks inspecting returned Service neighbours and their labelled tables.
8. **Blocked:** While Service details are loading, the dialog displays a loading state.
   - criterion-8-final.png shows an HTTP Browsing test-information panel, not a Service details loading state. The recorded Service points HTTP 500 blocks initiating Service details retrieval; map-points loading cannot establish this criterion.
9. **Blocked:** If Service details cannot be retrieved, the dialog displays an error state and does not display stale details.
   - criterion-9-final.png shows HTTP Browsing details, not a Service retrieval-error state. The recorded Service points HTTP 500 blocks opening Service details and checking error/stale-data handling; unrelated HTTP details do not prove stale Service data.

**Review summary:** Service selection and the unselected map are directly evidenced. Recorded Service points HTTP 500 prevents establishing matching authorised results and reaching Service details; visible Surveyor/HTTP Browsing panels are unrelated.
