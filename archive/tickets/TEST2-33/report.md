# TEST2-33 Evidence Review

- **Ticket:** TEST2-33 — Use the GIS map zoom controls
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-003
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Blocked:** Starting at the V4 launcher, after signing in if prompted, opening GIS, and waiting for the base map to finish loading, the map displays visible zoom-in (+) and zoom-out (-) controls that can be selected.
   - The selected attempt screenshot shows the sign-in page, and the authorized Continue action was stopped by the browser approval review, so GIS controls could not be reached.
2. **Blocked:** With the loaded GIS map at its initial zoom level, selecting the zoom-in (+) control once increases the zoom level and visibly shows a smaller geographic area without an application error.
   - Authentication was blocked before GIS could be reached; the selected attempt screenshot shows only the sign-in page.
3. **Blocked:** After zooming in once, selecting the zoom-out (-) control once decreases the zoom level and visibly shows a larger geographic area without an application error.
   - Authentication was blocked before GIS could be reached; the selected attempt screenshot shows only the sign-in page.

**Review summary:** All criteria are blocked because the required GIS session was unavailable after the browser approval review rejected the sign-in continuation. All three named PNG files exist and are non-empty in the selected attempt folder.
