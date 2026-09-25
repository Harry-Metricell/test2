# TEST2-33 Evidence Review

- **Ticket:** TEST2-33 — Use the GIS map zoom controls
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-002
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Blocked:** Starting at the V4 launcher, after signing in if prompted, opening GIS, and waiting for the base map to finish loading, the map displays visible zoom-in (+) and zoom-out (-) controls that can be selected.
   - The required Continue action was rejected, leaving the browser on the sign-in page; GIS and its zoom controls were unavailable.
2. **Blocked:** With the loaded GIS map at its initial zoom level, selecting the zoom-in (+) control once increases the zoom level and visibly shows a smaller geographic area without an application error.
   - The required Continue action was rejected, leaving the browser on the sign-in page; the map could not be loaded or zoomed.
3. **Blocked:** After zooming in once, selecting the zoom-out (-) control once decreases the zoom level and visibly shows a larger geographic area without an application error.
   - The required Continue action was rejected, leaving the browser on the sign-in page; the map could not be loaded or zoomed.

**Review summary:** 
