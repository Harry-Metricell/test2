# TEST2-93 Evidence Review

- **Ticket:** TEST2-93 — GIS: switch between base map styles
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)
- **Editable report:** [Download Word (.docx)](report.docx)

## Criterion results

1. **Passed:** In an ordinary map view in GIS, open the Map style control and verify that its chooser shows the current base map style and at least one alternative.
   - In criterion-1-final-0742697a-2f87-498a-aab9-fce39ca52ea9.png, the GIS Map style chooser is open over the light street map. The folded-map option has the blue selection fill and three distinct alternative style icons are visible. The Street name is recorded in the tester's accessible-label observation.
2. **Passed:** Select an alternative style and verify that the visible base map changes while the location and zoom level remain the same, comparing recognisable map features or the scale bar before and after.
   - criterion-2-baseline-map-25190bab-8734-4cc2-8010-0b8901d548d9.png shows the light Street map. criterion-2-chooser-cc6db78d-8586-4751-a1f2-fa11d9dc5110.png shows the Dark option and its tooltip in the open chooser. criterion-2-final-f6f4523e-1f91-415f-9d6c-ab38a1060f89.png shows the settled Dark map with the chooser closed. Birmingham, Milton Keynes and London remain in the same on-screen positions, and the scale bar stays at 50 km with the same displayed length. The source ticket separately requires a chooser capture and a changed-map capture. Those are present even though the checklist does not restate that evidence instruction.
3. **Passed:** Select the original style and verify that the original base map is restored.
   - criterion-3-baseline-map-16e32fe5-2a84-4cad-9cb2-50a5a70bf5bb.png shows the original light Street map, criterion-3-alternative-map-299b2b76-7763-4005-8c38-7069271ef3db.png shows the intervening Dark map, and criterion-3-final-4e93b6fa-8af5-496f-b921-1fda3ff13c99.png shows the restored light Street map after reselecting Street. The original road and coastline styling is visible again, with matching landmarks and the 50 km scale.

**Review summary:** The attempt shows the GIS style chooser, a visible Street-to-Dark change with the map location and zoom preserved, and restoration of Street. Separate chooser and changed-map screenshots meet the source capture instruction.
