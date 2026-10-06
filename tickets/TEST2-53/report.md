# TEST2-53 Evidence Review

- **Ticket:** TEST2-53 — Restore Show linked sites after two changes in V4 GIS
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With an authorised user signed in, GIS open, and an available Surveyor layer loaded with its default configuration, the Surveyor layer is identifiable in the layer list or legend.
   - criterion-1-initial.png shows Welcome, Harry; the pre-add Surveyor dialog shows Service, Last 30 days and unchanged filter defaults. criterion-1-final.png identifies Surveyor - Service in both Map layers and the legend after that baseline.
2. **Passed:** Opening Display Settings for the loaded Surveyor layer shows the Show linked sites control with a visibly identifiable checked or unchecked state.
   - criterion-2-after-add-layer.png identifies Surveyor - Service; criterion-2-final.png shows its Display Settings with Show linked sites visibly checked.
3. **Passed:** After recording the initial Show linked sites state, changing the control to the opposite state visibly changes its checked or unchecked state without adding the Surveyor layer again.
   - criterion-3-before-toggle.png shows Show linked sites checked and criterion-3-final.png shows it unchecked, with Surveyor - Service still listed throughout this criterion's single-add sequence.
4. **Passed:** Changing Show linked sites a second time restores the recorded initial checked or unchecked state without adding the Surveyor layer again.
   - criterion-4-before-toggle.png, criterion-4-after-toggle.png and criterion-4-final.png show checked, unchecked and checked respectively; Surveyor - Service remains listed with no further Add layer step.
5. **Passed:** After the state is changed and restored, closing and reopening Display Settings for the same Surveyor layer shows the recorded initial Show linked sites state, and the layer remains available without being added again.
   - criterion-5-before-toggle.png, after-toggle.png and after-restore.png show checked, unchecked and checked. criterion-5-after-close.png shows settings closed with Surveyor - Service retained; criterion-5-final.png shows the reopened control checked on that layer.

**Review summary:** Reviewed direct criterion-owned screenshot sequences for attempt-001 against all five canonical criteria; browser-derived result URLs identify the specified GIS destination.
