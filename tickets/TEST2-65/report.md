# TEST2-65 Evidence Review

- **Ticket:** TEST2-65 — Cancel and reopen Surveyor configuration in V4 GIS without adding a layer
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With the GIS catalogue visible and the pre-dialog Map layers list recorded, opening Surveyor configuration displays the Surveyor configuration dialog with visible Cancel and Add layer controls, without adding a layer.
   - criterion-1-before-open-surveyor.png records the GIS catalogue and absent Map layers baseline. criterion-1-after-open-surveyor.png and criterion-1-final.png show Surveyor with visible Cancel and Add layer controls, while Map layers remains absent and the map view is unchanged.
2. **Passed:** Selecting Cancel closes the Surveyor configuration dialog and returns to GIS with the map and layer catalogue visible; the Map layers entries and their order match the recorded pre-dialog baseline, including remaining absent when initially absent.
   - criterion-2-before-open-surveyor.png records the absent Map layers baseline; criterion-2-before-cancel.png shows the open dialog. criterion-2-after-cancel.png and criterion-2-final.png show it closed, with the GIS map and catalogue visible, Map layers still absent and the same map view.
3. **Passed:** After cancelling, opening Surveyor configuration again displays the dialog with its Cancel and Add layer controls available.
   - Criterion 3's own before-first-cancel, after-first-cancel and before-reopen captures show the open dialog closing to GIS. criterion-3-after-reopen.png and criterion-3-final.png show Surveyor reopened with available Cancel and Add layer controls.
4. **Passed:** Selecting Cancel in the reopened dialog returns to GIS with the original Map layers state intact and without an application-error page or sign-in screen interrupting the flow.
   - Criterion 4's own captures show open, first cancellation, reopening and second cancellation in order. criterion-4-after-second-cancel.png and criterion-4-final.png show GIS with the original absent Map layers state and unchanged map view; the captured sequence shows no application-error page or sign-in screen.

**Review summary:** Reviewed all four criteria using their own ordered attempt-001 screenshot sequences; browser-derived results identify the expected V4 GIS destination.
