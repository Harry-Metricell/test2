# TEST2-57 Evidence Review

- **Ticket:** TEST2-57 — Zoom the GIS map without losing a loaded Surveyor layer or its display setting
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With a test-created Surveyor layer loaded in GIS, the layer is identifiable in Map layers or the legend, and opening its Display Settings shows a recordable Show linked sites checkbox state.
   - Criterion-owned before-add, after-add and final screenshots show the newly added Surveyor - Service in Map layers and the legend, with Show linked sites checked in Display Settings.
2. **Passed:** With the same Surveyor layer loaded and Display Settings closed, after recording a settled initial map scale, selecting zoom-in once produces a closer settled map scale and the same layer remains identifiable in Map layers or the legend.
   - With Display Settings closed, criterion-2-before-zoom-in.png shows 100 km and criterion-2-final.png shows the closer 50 km scale; Surveyor - Service remains in Map layers and the legend. The reported tooltip interception occurred during cleanup, after this assertion.
3. **Passed:** After the zoom-in criterion passes, selecting zoom-out once returns the map to the recorded initial scale and the same Surveyor layer remains available without being added again.
   - Criterion 3's own ordered before-zoom-in, after-zoom-in, before-zoom-out and final screenshots show 100 km to 50 km to 100 km, retaining Surveyor - Service throughout; its recorded steps contain no intervening layer addition.
4. **Passed:** After completing the zoom-in and zoom-out journey, opening Display Settings for the same Surveyor layer shows the same Show linked sites checkbox state recorded before zooming.
   - Criterion 4's own baseline shows Show linked sites checked at 100 km; subsequent screenshots show settings closed, zoom to 50 km, return to 100 km, and reopened settings with Show linked sites still checked for Surveyor - Service.

**Review summary:** All four criteria are supported by their own screenshots and recorded ordered steps.
