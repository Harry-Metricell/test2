# TEST2-74 Evidence Review

- **Ticket:** TEST2-74 — V4 Surveyor: cancelling an unsaved Username leaves the map unchanged
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With GIS open and the existing Surveyor layer configuration opened from the catalogue, the configuration presents an editable Username field plus Cancel and Add layer controls.
   - criterion-1-after-open-surveyor.png and criterion-1-final.png show Surveyor with the Username textbox, Cancel and Add layer controls. Direct editing is corroborated by the focused textbox containing the synthetic value in criterion-2-after-edit-before-first-cancel.png.
2. **Passed:** After entering `TEST2-rehearsal-unsaved-20261012` in the Username field and selecting Cancel without selecting Add layer, reopening the same Surveyor configuration shows the Username field empty.
   - criterion-2-after-first-open-before-edit.png shows empty Username; criterion-2-after-edit-before-first-cancel.png shows TEST2-rehearsal-unsaved-20261012. The recorded Cancel step is supported by the dismissed dialog in criterion-2-after-first-cancel-before-reopen.png, followed by empty Username in criterion-2-after-reopen.png and criterion-2-final.png. The recovered sequence supports the result despite the disclosed tool-host timeout.
3. **Passed:** After cancelling the reopened Surveyor configuration, the visible map and complete active-layer list match the recorded initial state, and no Surveyor layer has been added.
   - criterion-3-baseline-map.png and criterion-3-baseline-layers.png show the unobscured map and complete single-item active list (ALL Coverage Gap Candidate Areas). criterion-3-after-edit-before-first-cancel.png, criterion-3-after-first-cancel-before-reopen.png and criterion-3-after-reopen-before-final-cancel.png show entered Username, dismissal and reopened empty Username. After the recorded final Cancel, criterion-3-restored-map.png, criterion-3-restored-layers.png and criterion-3-final.png match the baseline map, extent and complete list; no Surveyor layer appears and no list scrolling is needed. The existing coverage-gap loading error appears before and after.

**Review summary:** Reviewed all 24 referenced PNGs from attempt-001 and the live remote inputs. The browser-derived browserUrl for all criteria is https://o2intelligence-v4-dev.metricell.com/gis, matching the required development destination. The pre-existing coverage-gap loading error does not prevent assessing the Surveyor cancellation sequence.
