# TEST2-77 Evidence Review

- **Ticket:** TEST2-77 — V4 GIS: replace an unmatched catalogue query and restore the visible entries
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** From the initial top-of-catalogue view, entering `TEST2-no-match-rehearsal-20261013` leaves that exact query in the search field and shows no matching catalogue entries, including no Surveyor result.
   - criterion-1-restart-before-query.png shows the initial top catalogue; criterion-1-restart-after-query.png and criterion-1-final-assertion.png show the exact TEST2-no-match-rehearsal-20261013 query and no matching entries, including no Surveyor. The restarted final assertion resolves the reported earlier cleanup capture.
2. **Passed:** Replacing the unmatched query with `Surveyor` without reloading leaves `Surveyor` in the search field and displays its matching catalogue entry.
   - criterion-2-before-replace.png shows the unmatched query and no results; criterion-2-after-replace.png and criterion-2-final.png show Surveyor retained in the field with its matching entry. This criterion's recorded steps replace the query without navigation or reload.
3. **Passed:** Clearing the search field after the Surveyor result leaves it empty and restores the same catalogue entries and browsing controls visible in the initial top-of-catalogue viewport, at the same browsing position.
   - criterion-3-baseline-catalogue.png establishes the initial top viewport; criterion-3-before-replace.png shows no match and criterion-3-before-clear.png shows Surveyor. criterion-3-after-clear.png and criterion-3-final.png show an empty field and the same visible entries, expanded groups, entry controls and Snapshots control at the same top scrollbar position. Only the initial visible viewport is assessed; the recovered launcher interaction does not contradict the restored catalogue.
4. **Passed:** The visible map retains its initial extent and scale during both query changes and after clearing.
   - criterion-4-baseline-map.png provides the unobscured baseline; criterion-4-after-unmatched-before-replace.png and criterion-4-after-replace-before-clear.png retain the same coastline, landmarks and extent. criterion-4-after-clear.png and criterion-4-final.png preserve those positions and the 500 m scale. The Clear wait timeout reflects an empty active-layer baseline, not a visible map defect.
5. **Blocked:** The complete active-layer list retains its initial entries and order during both query changes and after clearing, with no new layer added.
   - criterion-5-baseline-layers.png shows no active-layer panel or populated entries. criterion-5-after-unmatched-before-replace.png, criterion-5-after-replace-before-clear.png and criterion-5-final.png remain empty with no new layer or visible alert, but populated entry and order retention could not be tested because the active-layer fixture was unavailable. Earlier criteria's Network Information layer is not reused.

**Review summary:** Evidence assessment completed for all five criteria; populated active-layer preservation is blocked by the missing active-layer fixture.
