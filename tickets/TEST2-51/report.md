# TEST2-51 Evidence Review

- **Ticket:** TEST2-51 — Reopen Surveyor Display Settings without losing the loaded V4 GIS layer
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With an available Surveyor layer loaded in GIS using its default configuration, the layer legend shows the Surveyor layer name and a Display Settings control.
   - The unchanged initial Surveyor configuration shows Service / Last 30 days; after adding it, Surveyor - Service appears in the layer list and legend with Display Settings.
2. **Passed:** When Display Settings is opened for the loaded Surveyor layer, the panel shows Show linked sites with a clearly identifiable checked or unchecked state.
   - criterion-2-final.png shows the loaded Surveyor - Service layer and an open Display Settings panel with Show linked sites visibly checked.
3. **Passed:** When Display Settings is closed, the settings panel is dismissed while the same Surveyor layer remains in the layer list and its legend remains available.
   - The criterion's before-close screenshot shows Display Settings open; its final screenshot shows the panel dismissed while Surveyor - Service remains in the layer list and legend.
4. **Passed:** When Display Settings is reopened for the same Surveyor layer without adding the layer again, Show linked sites has the same checked or unchecked state observed before the panel was closed.
   - The criterion's ordered before-close, after-close, and reopened screenshots show Show linked sites checked before and after reopening, with the same Surveyor - Service layer retained; recorded steps contain no layer re-add.

**Review summary:** Completed independent screenshot review of all four criteria for attempt-001.
