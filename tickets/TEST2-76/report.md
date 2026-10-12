# TEST2-76 Evidence Review

- **Ticket:** TEST2-76 — V4 GIS: recover from an unmatched catalogue search and cancel Surveyor configuration
- **QA status:** Evidence Reviewed
- **Overall outcome:** Unverified
- **Evidence reviewed:** attempt-002
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With the GIS catalogue open, entering `TEST2-no-match-showcase-20261012` leaves the query visible and shows no matching catalogue entries, including no Surveyor result.
   - criterion-1-after-unmatched-search.png and criterion-1-final.png show TEST2-no-match-showcase-20261012 retained with 'No layers match this search' and no Surveyor entry.
2. **Passed:** Replacing that query with `Surveyor` without reloading shows the Surveyor matching entry.
   - criterion-2-before-replace-query.png shows the unmatched query and no results; criterion-2-after-replace-query.png shows Surveyor and its matching entry. The recorded steps replace the query in place without reload.
3. **Passed:** Opening the Surveyor configuration displays an editable Username field and Cancel and Add layer controls.
   - criterion-3-after-open-configuration.png and criterion-3-final.png show the Surveyor configuration with a normal Username input and visible Cancel and Add layer controls.
4. **Passed:** Entering `TEST2-showcase-unsaved-20261012` in Username and selecting Cancel without Add layer closes the configuration; reopening the same configuration shows an empty Username field.
   - criterion-4-after-first-edit.png shows TEST2-showcase-unsaved-20261012 entered; criterion-4-after-first-cancel.png shows the configuration closed with the existing single layer retained; criterion-4-after-reopen.png and criterion-4-final.png show the reopened Surveyor Username empty.
5. **Unverified:** After cancelling the reopened configuration and clearing the catalogue query, the search field is empty and the original catalogue entries and browsing position are restored.
   - criterion-5-baseline-catalogue.png and criterion-5-after-clear-query.png show the same visible catalogue entries and top browsing position, with the search empty after the criterion-owned edit, cancel, reopen and final-cancel sequence. Entries below the captured viewport have no baseline/restored screenshots, so the claimed restoration of all original catalogue entries is unverified.
6. **Passed:** After these actions, the visible map and complete active-layer list match their recorded initial states, with no Surveyor layer added.
   - criterion-6-baseline-map.png and criterion-6-baseline-layers.png show the original map and complete one-row active-layer list. criterion-6-after-unmatched-search.png and criterion-6-after-replace-query.png preserve them; criterion-6-after-first-edit.png, criterion-6-after-first-cancel.png, criterion-6-after-reopen.png and criterion-6-after-final-cancel.png show the cancellation journey. criterion-6-restored-map.png and criterion-6-restored-layers.png match the baseline map, sole ALL Coverage Gap Candidate Areas layer and existing loading alert; no Surveyor layer appears.

**Review summary:** Reviewed the criterion-owned attempt-002 screenshots. Catalogue restoration lacks comparison captures for entries below the visible viewport.
