# TEST2-33 Evidence Review

- **Ticket:** TEST2-33 — Use the GIS map zoom controls
- **QA status:** Evidence Reviewed
- **Overall outcome:** Unverified
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Unverified:** Starting at the V4 launcher, after signing in if prompted, opening GIS, and waiting for the base map to finish loading, the map displays visible zoom-in (+) and zoom-out (-) controls that can be selected.
   - The required PNGs exist and browserUrl is on the expected V4 host, but both criterion-specific screenshots show the launcher; neither directly shows the GIS zoom controls after opening GIS.
2. **Passed:** With the loaded GIS map at its initial zoom level, selecting the zoom-in (+) control once increases the zoom level and visibly shows a smaller geographic area without an application error.
   - The before and after screenshots show the map scale changing from 100 km to 50 km, with the zoom-in control visible and no application error shown.
3. **Passed:** After zooming in once, selecting the zoom-out (-) control once decreases the zoom level and visibly shows a larger geographic area without an application error.
   - The before and after screenshots show the map scale changing from 50 km to 100 km after zoom-out, with no application error shown.

**Review summary:** 
