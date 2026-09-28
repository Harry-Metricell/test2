# TEST2-36 Evidence Review

- **Ticket:** TEST2-36 — Pan the V4 GIS base map and keep controls usable
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** Starting on the GIS page with the base map loaded, visible map controls are present and no application error is displayed.
   - The initial and final screenshots show the loaded GIS base map and visible controls without an application error. The result browserUrl is https://o2intelligence-v4-dev.metricell.com/gis, matching the expected V4 host.
2. **Passed:** Drag the base map to a different position; the visible geographic area changes while the GIS page remains open.
   - The before-pan screenshot shows the UK and nearby Europe; the after-pan screenshot shows central Europe and the Mediterranean, with the GIS page still open.
3. **Passed:** After the pan completes, the map controls remain visible and can be used, and no application error is displayed.
   - The post-pan zoom-in and zoom-out screenshots show the map changing scale and the controls remaining visible; the final screenshot shows the map at the restored zoom with no application error.

**Review summary:** 
