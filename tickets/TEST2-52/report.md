# TEST2-52 Evidence Review

- **Ticket:** TEST2-52 — Keep the Surveyor layer available while changing Show linked sites in V4 GIS
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With an available Surveyor layer loaded using its default configuration, opening Display Settings shows Show linked sites with a visibly identifiable checked or unchecked state, and the same layer is identifiable in the layer list or legend.
   - The initial unloaded state and untouched Surveyor dialog show Service, Last 30 days and default filters before adding; the loaded Surveyor - Service layer and legend remain identifiable when Display Settings opens with Show linked sites checked.
2. **Passed:** Changing Show linked sites to the opposite state visibly changes the checkbox state; after closing Display Settings, the same Surveyor layer remains in the layer list and its legend remains available.
   - This criterion's before/after screenshots show Show linked sites changing from checked to unchecked; after closing Display Settings, Surveyor - Service remains in Map layers with its expanded legend.
3. **Passed:** Reopening Display Settings for the same Surveyor layer shows the changed Show linked sites checkbox state without adding the layer again.
   - This criterion's ordered screenshots and steps show checked, toggled unchecked, settings closed, and reopened unchecked for Surveyor - Service, with the same layer and legend retained and no intervening add-layer action.

**Review summary:** Criterion-specific screenshots establish all three visible UI criteria; browser-derived URLs identify the required environment at /gis.
