# TEST2-34 Evidence Review

- **Ticket:** TEST2-34 — Verify V4 launcher opens GIS and browser Back returns to launcher
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** Starting from the V4 launcher at https://o2intelligence-v4-dev.metricell.com/launcher, with sign-in completed if prompted, the page shows a GIS module card with an enabled Open GIS control.
   - The attempt screenshots show the launcher with the GIS module card and its enabled arrow control. The corresponding browserUrl is the expected V4 launcher URL.
2. **Passed:** Selecting the enabled Open GIS control navigates to https://o2intelligence-v4-dev.metricell.com/gis, and the GIS page loads without an application error.
   - The after-open and final screenshots show the GIS page with its map and controls loaded. The corresponding browserUrl is the expected V4 GIS URL.
3. **Passed:** From the loaded GIS page, using the browser Back button returns to https://o2intelligence-v4-dev.metricell.com/launcher, where the GIS module card is visible again.
   - The screenshots show the loaded GIS page before Back and the launcher with the GIS card afterward. The corresponding browserUrl is the expected V4 launcher URL.

**Review summary:** 
