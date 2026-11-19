# TEST2-93 Evidence Review

- **Ticket:** TEST2-93 — GIS: switch between base map styles
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-002
- **Report:** [Evidence report](report.pdf)
- **Editable report:** [Download Word (.docx)](report.docx)

## Criterion results

1. **Blocked:** In an ordinary map view in GIS, open the Map style control and verify that its chooser shows the current base map style and at least one alternative.
   - criterion-1-blocker-93e7f4c7-3f32-43ac-ba73-17587673203e.png shows the Metricell sign-in form after the launcher redirect. GIS access was blocked before the chooser could be opened or its current and alternative styles inspected. The source-required separate chooser capture could not be taken.
2. **Blocked:** Select an alternative style and verify that the visible base map changes while the location and zoom level remain the same, comparing recognisable map features or the scale bar before and after.
   - criterion-2-blocker-ae9d36fa-bb0a-4d9c-8573-691157eeffdc.png shows “Request failed” on the authentication page. The tester recorded HTTP 500 during authentication. GIS access was blocked before an alternative could be selected, so there was no before-and-after comparison of map appearance, location or zoom and no separate changed-map capture.
3. **Blocked:** Select the original style and verify that the original base map is restored.
   - criterion-3-blocker-7628157e-d2ca-4d62-9539-59a9e802ca7c.png shows the Metricell sign-in form after a fresh launcher navigation. GIS access was blocked before the original base map could be restored or compared with the starting view.

**Review summary:** The selected GIS attempt stopped at authentication. The criterion captures show the sign-in form or the authentication error, so the map-style behaviour and required GIS captures could not be verified.
