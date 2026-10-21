# TEST2-87 Evidence Review

- **Ticket:** TEST2-87 — Display Call Point Details
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Blocked:** When a completed Call test is opened in the shared point-detail dialog, its summary shows the available duration, test result, connection time, start time, end time, handset, and disconnection cause.
   - criterion-1-call-config.png confirms Automobile > Call; criterion-1-final.png shows the Automobile - Call layer and legend without visible Call points or a detail dialog. Results record GET /api/platform/automobile/call/points HTTP 500, reproduced on a fresh load; this is unavailable point retrieval, not a settled empty response. Completed-record selection and summary fields could not be tested.
2. **Blocked:** When Call samples are returned, the timeline chart shows call state, service technology, and signal strength across the test duration.
   - criterion-2-call-config-selected.png confirms Automobile > Call; criterion-2-final.png shows the Automobile - Call layer and legend without visible Call points or a detail dialog. Results record GET /api/platform/automobile/call/points HTTP 500, reproduced on a fresh load; this is unavailable point retrieval, not a settled empty response. No record or samples were available to test timeline state, technology or signal strength.
3. **Blocked:** When Call samples are returned, the dialog displays them in a table whose columns can be sorted and filtered.
   - criterion-3-final.png confirms Automobile > Call configuration, not a detail dialog. Testing stopped at the shared prerequisite: results record GET /api/platform/automobile/call/points HTTP 500 on the first and controlled fresh loads. No samples were available to exercise table sorting and filtering.
4. **Blocked:** For each displayed Call sample, the Serving Cell column shows the known serving site/cell when available; when it is unavailable, it shows that sample’s CGI.
   - criterion-4-final.png confirms Automobile > Call configuration, not a detail dialog. Testing stopped at the shared prerequisite: results record GET /api/platform/automobile/call/points HTTP 500 on the first and controlled fresh loads. No samples were available to check known Serving Cell values or CGI fallback. The before-configuration capture still shows GIS loading; later configuration captures show the map, not a Call detail state.
5. **Blocked:** Selecting a displayed Call sample opens the related Service details for the selected sample’s point in time.
   - criterion-5-final.png confirms Automobile > Call configuration, not a detail dialog. Testing stopped at the shared prerequisite: results record GET /api/platform/automobile/call/points HTTP 500 on the first and controlled fresh loads. No sample could be selected to verify Service details at its timestamp.
6. **Blocked:** When the selected Call point has no measurable duration, the dialog shows the standard no-data state instead of an empty detail view.
   - criterion-6-final.png confirms Automobile > Call configuration, not a detail dialog. Testing stopped at the shared prerequisite: results record GET /api/platform/automobile/call/points HTTP 500 on the first and controlled fresh loads. No zero-duration record could be selected to verify the dialog's no-data state. The before-configuration capture still shows GIS loading; later configuration captures show the map, not a Call detail state.
7. **Blocked:** While Call details are loading, the dialog shows the standard loading state; when details are unavailable, it shows the standard no-data state; when loading fails, it shows the standard error state, with no incorrect Call data displayed.
   - criterion-7-final.png confirms Automobile > Call configuration, not a detail dialog. Testing stopped at the shared prerequisite: results record GET /api/platform/automobile/call/points HTTP 500 on the first and controlled fresh loads. No detail request was established to test loading, no-data, error or stale-data handling; the points failure does not prove a detail-error state. No simulation was used. The before-configuration capture still shows GIS loading; later configuration captures show the map, not a Call detail state.

**Review summary:** Automobile / Call scope verified from the selected cycle-002 attempt. All seven criteria remain blocked by unavailable Call point retrieval; browser evidence was captured, but Call detail testing could not be completed. All 32 referenced PNGs exist and are non-empty; none establishes detail behavior.
