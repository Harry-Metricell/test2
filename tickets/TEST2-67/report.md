# TEST2-67 Evidence Review

- **Ticket:** TEST2-67 — Open API Request Audit from V4 launcher and return to GIS
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** Starting from the authorised V4 launcher, the page displays GIS and API Request Audit cards, each with an Open module control.
   - Initial and final launcher images show GIS and API request audit cards with arrow Open controls; the browser-derived URL is the authorised /launcher address.
2. **Passed:** After selecting Open for API Request Audit, the module displays identifiable audit content, such as request metrics or the Requests and errors over time chart, rather than a sign-in or application error page; specific metric values are not required.
   - The criterion-owned sequence shows the launcher followed by API request audit metrics and the Requests and errors over time chart, with the browser-derived URL on the authorised /api-request-audit destination.
3. **Passed:** After viewing API Request Audit, using browser Back returns to the launcher and GIS remains available.
   - The criterion-owned sequence shows launcher, populated audit content, and the launcher after browser Back, with GIS and its Open control visible; the final browser-derived URL is the exact authorised /launcher address.
4. **Passed:** From the returned launcher, selecting Open for GIS displays the settled map and map controls rather than a sign-in or application error page.
   - The criterion-owned sequence shows launcher, audit, returned launcher, then a settled GIS basemap with streets, labels and map controls at the browser-derived /gis destination. The coverage-gap layer panel reports a data load error, but the map and controls render.

**Review summary:** Completed assessment of all four criteria using attempt-001 screenshots and browser-derived URL records.
