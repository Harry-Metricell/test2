# TEST2-62 Evidence Review

- **Ticket:** TEST2-62 — Navigate from the V4 launcher through GIS and API Request Audit and back
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** Starting from the authorised V4 launcher with its module cards visible, open GIS and verify that the GIS destination settles on a map with visible map controls, rather than a login or application-error page.
   - Criterion-owned launcher before-open captures show authorised module cards; after-open and final captures show a settled UK/Ireland GIS map with Search Map, north reset and zoom controls, with no login or application-error page. Browser-derived browserUrl confirms the GIS destination.
2. **Passed:** Starting from the authorised V4 launcher, open GIS, wait for the GIS map to load, then use browser Back and verify that the launcher returns with its module cards visible, including API Request Audit.
   - Criterion-owned ordered captures and steps show launcher to loaded GIS, then browser Back to launcher. After-back and final captures show module cards including API request audit; browser-derived browserUrl confirms the launcher destination.
3. **Passed:** Starting from the returned authorised V4 launcher with its module cards visible, open API Request Audit and verify that the audit destination shows identifiable audit content, such as request metrics or the Requests and errors over time chart, rather than a login or application-error page.
   - Criterion-owned ordered captures and steps show launcher to settled GIS, Back to the returned launcher, then API request audit. After-open-audit and final captures show populated request metrics and the Requests and errors over time chart, with no login or application-error page; browser-derived browserUrl confirms the audit destination.
4. **Passed:** Starting from the authorised V4 launcher, open API Request Audit, wait for the audit content to load, then use browser Back and verify that the launcher returns with both GIS and API Request Audit cards available.
   - Criterion-owned ordered captures and steps show launcher to populated API request audit, then browser Back. After-back and final captures show both GIS and API request audit cards available; browser-derived browserUrl confirms the launcher destination.

**Review summary:** Reviewed all four criteria against their own attempt-001 screenshots, ordered steps and browser-derived destination URLs.
