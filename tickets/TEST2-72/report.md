# TEST2-72 Evidence Review

- **Ticket:** TEST2-72 — V4 Surveyor configuration: discard an unsaved Username edit
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With Surveyor configuration open and Username, Cancel, and Add layer visible, enter `TEST2-showcase-unsaved` and verify the complete value is visibly present in Username before cancelling.
   - criterion-1-before-edit.png shows Username, Cancel and Add layer; criterion-1-final.png shows the complete TEST2-showcase-unsaved value in Username before cancellation. criterion-1-cleanup.png shows the dialog closed.
2. **Passed:** After selecting Cancel and reopening Surveyor configuration, verify Username is empty while Cancel and Add layer remain available.
   - The criterion-owned sequence shows TEST2-showcase-unsaved in criterion-2-first-edited-before-cancel.png, the closed dialog in criterion-2-after-first-cancel-before-reopen.png, then empty Username with Cancel and Add layer in criterion-2-final.png. criterion-2-cleanup.png shows the reopened dialog closed.
3. **Passed:** After cancelling the reopened dialog, verify the unobscured map view and complete Map layers entries and order match the original pre-dialog baseline, with no new Surveyor layer.
   - criterion-3-baseline-map.png and criterion-3-baseline-layers.png show the original unobscured map at 300 m scale and complete single-entry list, ALL Coverage Gap Candidate Areas. The recovered sequence shows the open dialog in criterion-3-first-open-before-edit.png, complete edit in criterion-3-first-edit-before-cancel.png, closed dialog in criterion-3-first-closed-before-reopen.png and reopened empty Username in criterion-3-final-reopened-empty-before-cancel.png. After final Cancel, criterion-3-final-restored-layers.png and criterion-3-final.png match the baseline map extent, content, scale and complete layer list/order, with no Surveyor layer. The existing coverage gap load alert is unchanged; the earlier stale-reference interaction is not an application defect.

**Review summary:** All three criteria are directly supported by their own attempt-001 screenshots and recorded steps; browser-derived final URLs point to https://o2intelligence-v4-dev.metricell.com/gis.
