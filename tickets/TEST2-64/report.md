# TEST2-64 Evidence Review

- **Ticket:** TEST2-64 — Recover the V4 GIS layer catalogue after a search with no matching layers
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With GIS open, the Search layers field accepts Surveyor, keeps the entered text visible, shows the Surveyor catalogue entry in the filtered results, and keeps the map visible.
   - Criterion 1 baseline shows empty Search layers; final shows retained Surveyor text and the Surveyor entry under Tests and Measurements with the map visible. Cleanup restores the empty search.
2. **Passed:** Replacing the search text with zzqa_no_layer_match_20261008 keeps that text visible, shows no matching layer entries, and leaves GIS usable with the map visible rather than an application-error page or sign-in screen.
   - Criterion 2 sequence shows Surveyor replaced by zzqa_no_layer_match_20261008; final retains the exact text and displays No layers match this search with no catalogue entries. The map and GIS controls remain visible without an error or sign-in screen.
3. **Passed:** Clearing Search layers with its normal UI control leaves the field empty, restores the baseline visible catalogue groups and Surveyor entry, and preserves the baseline Map layers entries and order, including leaving the list absent when it was absent at baseline.
   - Criterion 3 own sequence shows the baseline, Surveyor search, no-match state and clear. Final has an empty search, the same visible Network, Area Summary, RPO, Tests and Measurements, SMIP and CET Scanner Data, Improvement Areas and Planning groups, and restored Surveyor. Map layers is absent before and after and the map view matches.
4. **Passed:** After the no-match search has been cleared, entering Surveyor again keeps the text visible, shows the Surveyor catalogue entry, and keeps the map visible.
   - Criterion 4 own ordered sequence shows Surveyor, no-match, clear to an empty search with restored catalogue, then Surveyor again. Final retains Surveyor text, shows the Surveyor entry and keeps the map visible; cleanup clears the search.

**Review summary:** Reviewed all four criteria against their own ordered screenshots from attempt-001; all 21 referenced PNGs exist and are non-empty.
