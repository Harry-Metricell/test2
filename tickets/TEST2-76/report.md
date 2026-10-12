# TEST2-76 Evidence Review

- **Ticket:** TEST2-76 — V4 GIS: recover from an unmatched catalogue search and cancel Surveyor configuration
- **QA status:** Evidence Reviewed
- **Overall outcome:** Unverified
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With the GIS catalogue open, entering `TEST2-no-match-showcase-20261012` leaves the query visible and shows no matching catalogue entries, including no Surveyor result.
   - criterion-1-after-unmatched-search.png and criterion-1-final.png show TEST2-no-match-showcase-20261012 retained in the search field and 'No layers match this search', with no Surveyor result.
2. **Passed:** Replacing that query with `Surveyor` without reloading shows the Surveyor matching entry.
   - criterion-2-before-replace-query.png shows the unmatched query with no results; criterion-2-after-replace-query.png and criterion-2-final.png show Surveyor and its matching entry. The recorded ordered steps replace the query without reloading.
3. **Unverified:** Opening the Surveyor configuration displays an editable Username field and Cancel and Add layer controls.
   - criterion-3-after-open-configuration.png and criterion-3-final.png show the Surveyor dialog with an empty Username field, Cancel and Add layer controls. This criterion's captures do not demonstrate Username accepting input; the reported enabled/not-read-only state alone does not prove editability.
4. **Passed:** Entering `TEST2-showcase-unsaved-20261012` in Username and selecting Cancel without Add layer closes the configuration; reopening the same configuration shows an empty Username field.
   - criterion-4-after-first-edit-username.png and criterion-4-before-first-cancel-confirmed.png show TEST2-showcase-unsaved-20261012 entered. criterion-4-after-first-cancel-confirmed.png shows the dialog closed with only the existing coverage-gap layer; criterion-4-after-final-reopen.png and criterion-4-final.png show the reopened Surveyor dialog with empty Username.
5. **Passed:** After cancelling the reopened configuration and clearing the catalogue query, the search field is empty and the original catalogue entries and browsing position are restored.
   - criterion-5-baseline-catalogue.png records the original entries and browsing position. The criterion-owned search/edit/cancel/reopen sequence culminates in criterion-5-after-reopen-configuration.png showing empty Username, criterion-5-after-final-cancel.png showing the closed dialog, and criterion-5-after-final-clear-query.png / criterion-5-final.png showing empty search and restored catalogue entries at the same top scroll position.
6. **Passed:** After these actions, the visible map and complete active-layer list match their recorded initial states, with no Surveyor layer added.
   - criterion-6-baseline-map.png and criterion-6-baseline-layers.png show the original map extent/features and complete one-item active-layer list: ALL Coverage Gap Candidate Areas. criterion-6-after-unmatched-search.png and criterion-6-after-replace-query.png preserve these during search. After the entered Username, cancellation, empty-field reopening and final cancellation, criterion-6-after-final-clear-query.png, criterion-6-final-map.png and criterion-6-final-layers.png match the baselines with no Surveyor layer. The existing coverage-gap load error is unchanged.

**Review summary:** Completed screenshot assessment of attempt-001; Username editability is not demonstrated within criterion 3's own captures.
