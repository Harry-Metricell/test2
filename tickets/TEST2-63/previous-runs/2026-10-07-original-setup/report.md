# TEST2-63 Evidence Review

- **Ticket:** TEST2-63 — Filter the V4 GIS layer catalogue for Surveyor and restore the original view
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Blocked:** With GIS open and Search layers empty, the layer catalogue visibly contains a Surveyor entry, and the currently loaded Map layers list is recorded as the baseline.
   - Empty Search layers, Surveyor and the map are visible in criterion-1-final.png. The required Map layers list is unavailable, so loaded-layer entries and order cannot be recorded as a baseline.
2. **Blocked:** After entering Surveyor in Search layers, the entered text remains visible and the filtered catalogue visibly contains a Surveyor entry, without loading or removing a map layer.
   - Criterion 2 shows Surveyor retained in the search and a filtered Surveyor entry. The required Map layers list is unavailable before and after searching, preventing direct verification that loaded layers remain unchanged.
3. **Blocked:** After clearing Search layers, the original catalogue entries are visible again, and the loaded Map layers list contains the same entries in the same order as the recorded baseline.
   - Criterion 3 shows the search cleared and the visible original catalogue entries restored in their original order. The required Map layers list and loaded-layer baseline are unavailable, preventing comparison of loaded entries and order.
4. **Passed:** After the catalogue is restored, the application remains in GIS with the map visible and no application-error page or sign-in screen has interrupted the search-and-clear journey.
   - Criterion 4's own ordered search-and-clear captures show GIS throughout, the catalogue restored with empty search, and the map visible in the final state; no error or sign-in screen appears in the captured journey. The browser-derived URL confirms the GIS destination.

**Review summary:** The required Map layers list is unavailable in the existing GIS configuration, blocking loaded-layer baseline and invariance checks.
