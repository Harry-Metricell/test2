# TEST2-61 Evidence Review

- **Ticket:** TEST2-61 — Recover the GIS layer catalogue from a no-match search without changing loaded layers
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With GIS open, one test-created Surveyor layer loaded using defaults, and Search layers empty, the unfiltered catalogue visibly includes Surveyor and the recorded non-Surveyor catalogue entry, while the test-created layer is identifiable in Map layers or the legend.
   - criterion-1-after-collapse-network.png shows one existing Surveyor - Service; the newly opened dialog and pre-confirmation capture show unchanged Service / Last 30 days options. criterion-1-final.png shows empty Search layers, Beacons, Surveyor (2), and the added second Surveyor - Service row.
2. **Passed:** After entering TEST2_NO_SUCH_LAYER_20261006 in Search layers, neither recorded catalogue entry is visible in the filtered catalogue.
   - criterion-2-before-no-match.png shows Beacons and Surveyor; criterion-2-after-no-match.png and criterion-2-final.png show TEST2_NO_SUCH_LAYER_20261006 and a catalogue with no entries. The recorded interaction timeout was recovered before filtering.
3. **Passed:** While the non-matching search is active, the entered search text remains visible and the Map layers list is unchanged from the pre-search state.
   - The criterion-3 recheck baseline and asserted captures at 0, 8, 16, 24 and 32 show the same complete 33-row list in the same order, including the final Surveyor - Service. The non-matching search text remains visible throughout the asserted captures; this complete recheck supersedes the earlier incomplete coverage.
4. **Passed:** After clearing Search layers, both recorded catalogue entries are visible again.
   - criterion-4-after-no-match.png shows the empty filtered catalogue; criterion-4-after-clear-no-match.png and criterion-4-final.png show an empty search and both Beacons (1) and Surveyor (2) restored.
5. **Passed:** After clearing the non-matching search, the original Map layers list is unchanged, with no layer added or removed.
   - The criterion-5 recheck baseline and asserted captures at 0, 8, 16, 24 and 32 show the same complete 33-row list and ordering. Its own no-match and clear captures show the intervening search and recovery; the recovered recheck supersedes earlier incomplete list coverage.
6. **Passed:** After searching for Surveyor in Search layers, the Surveyor catalogue entry is visible.
   - criterion-6-after-search-surveyor.png and criterion-6-final.png show Surveyor in Search layers and the Surveyor (2) entry in the filtered catalogue.
7. **Passed:** After clearing the Surveyor search, the original catalogue and the same loaded layers are restored.
   - The criterion-7 recheck captures show its own no-match, clear, Surveyor and clear sequence. Baseline and asserted captures at 0, 8, 16, 24 and 32 show the same complete 33-row list and original visible catalogue with empty search; this recheck supersedes earlier incomplete coverage.
8. **Passed:** The search journey completes without an error page or sign-in screen interrupting it.
   - The criterion-8 search sequence and final capture remain in GIS with no error page or sign-in screen. criterion-8-after-open-gis.png still shows loading, but criterion-8-before-no-match.png shows the settled map before the complete no-match, clear, Surveyor and clear journey.

**Review summary:** Completed assessment of all eight canonical criteria using criterion-owned screenshots from attempt-001.
