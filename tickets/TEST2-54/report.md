# TEST2-54 Evidence Review

- **Ticket:** TEST2-54 — Zoom and reset the V4 GIS map
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Blocked:** Starting from the launcher with authorised access, opening GIS displays a settled map with visible zoom-in and reset-map-view controls.
   - Launcher and final GIS images show a settled 100 km map and zoom controls, but no geographic-extent reset control is available in the visible control stack. The recorded control inspection identifies the reset as orientation-only.
2. **Passed:** From the recorded initial map view, selecting zoom-in once produces a visibly closer settled map view while the GIS workspace and map controls remain available.
   - This criterion's before-zoom image shows 100 km coverage; after-zoom and final images show a settled 50 km map with larger Ireland and detailed labels while GIS controls remain visible, matching the recorded single zoom-in. cleanup-default still shows 50 km; cleanup-restored proves the later return to 100 km.
3. **Blocked:** After zooming, selecting reset map view returns the map to its initial default geographic extent and scale as visibly demonstrated, while the GIS controls remain available.
   - This criterion records the initial 100 km view and zoomed 50 km view, but the final image labels the available reset 'Reset north and flatten map'; the required geographic-extent reset action is unavailable. Cleanup returns to the initial coverage using Zoom out, which does not demonstrate reset-map-view behavior.

**Review summary:** Evidence assessment completed for attempt-001; geographic-extent reset control is unavailable.
