# TEST2-46 Evidence Review

- **Ticket:** TEST2-46 — Verify Surveyor layer defaults and switching in V4 GIS
- **QA status:** Evidence Reviewed
- **Overall outcome:** Failed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Unverified:** With two supported Surveyor layers available in the V4 GIS layer panel, select the first layer and verify that its displayed configuration matches that layer's configured defaults.
   - Screenshots show Surveyor - Service selected and its configuration, but the layer panel lists only one Surveyor catalog item and no independent configured-default reference is available to establish that these are the configured defaults.
2. **Passed:** After selecting a second supported Surveyor layer, verify that it becomes the active layer and that the displayed configuration matches the second layer's configured defaults rather than the previously selected layer's configuration.
   - The screenshots show Surveyor - Download as the active layer with Download Rate legend bands after switching from Service, supporting that the active configuration changed.
3. **Failed:** After saving or otherwise entering a valid GIS state with a Surveyor layer selected, restore or reload that GIS state and verify that the same Surveyor layer remains selected and its displayed options are restored without an invalid selection state.
   - The after-restore screenshot shows Surveyor - Service with Signal Strength, while the state previously applied was Surveyor - Download with Download Rate; the applied selection and options did not persist through reopening GIS.

**Review summary:** 
