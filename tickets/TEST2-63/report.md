# TEST2-63 Evidence Review

- **Ticket:** TEST2-63 — Filter the V4 GIS layer catalogue for Surveyor and restore the original view
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-002
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With GIS open, Search layers empty, and the permitted setup complete, the catalogue visibly contains Surveyor and the tester has recorded the complete loaded Map layers entries and their order as the pre-search baseline.
   - criterion-1-final.png shows GIS with Search layers empty, Surveyor (1) in the unfiltered catalogue and the complete Map layers baseline containing only Surveyor - Service at position 1. The criterion-owned setup images show the initially empty loaded-layer state and the Surveyor configuration before addition.
2. **Passed:** After entering `Surveyor` in Search layers, the search text remains visible, Surveyor is visible in the filtered catalogue, and the loaded Map layers entries and order are unchanged from the recorded pre-search baseline.
   - criterion-2-before-search.png records the unfiltered catalogue and sole loaded layer Surveyor - Service. criterion-2-final.png shows Surveyor retained in Search layers and Surveyor (1) in the filtered catalogue, with the same sole Map layers entry and order.
3. **Passed:** After clearing Search layers, the original catalogue entries are visible again and the loaded Map layers entries and order match the recorded pre-search baseline.
   - The criterion-3 before-search, after-search, before-clear, after-clear and final images show the complete search-and-clear sequence. The cleared state restores the original visible catalogue entries, including Network Information, RPO entries, Tests and Measurements, Surveyor (1), Improvement Areas and Planning; the sole loaded layer remains Surveyor - Service in its original position.
4. **Passed:** After the search-and-clear journey, the user remains in GIS, the map is visible, and no application-error page or sign-in screen has interrupted the journey.
   - The criterion-4 before-search, after-search, before-clear, after-clear and final images show GIS and the map throughout the recorded search-and-clear journey without an error or sign-in screen. The final image shows empty search and the restored catalogue, and the browser-derived browserUrl is https://o2intelligence-v4-dev.metricell.com/gis.

**Review summary:** Reviewed the four canonical criteria using attempt-002 criterion-owned screenshots and live remote inputs; all referenced PNGs exist and are non-empty.
