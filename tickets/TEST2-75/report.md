# TEST2-75 Evidence Review

- **Ticket:** TEST2-75 — V4 GIS catalogue: find Surveyor and clear the search without changing the map
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With the GIS layer catalogue open, entering `Surveyor` in the Search layers control keeps the query visible and shows the Surveyor catalogue entry as a matching result.
   - criterion-1-before-search.png shows the open catalogue; criterion-1-final.png shows Surveyor retained in Search layers and a matching Surveyor entry under Tests and Measurements.
2. **Passed:** Clearing the search query leaves the search field empty and restores the original catalogue entries and browsing controls at the recorded catalogue position.
   - criterion-2-before-search.png, criterion-2-before-clear.png and criterion-2-final.png show the original top-position catalogue, Surveyor query, then an empty query with the same entries, browsing controls and scrollbar position restored.
3. **Passed:** The visible map remains the same as its recorded initial state while searching and after the query is cleared.
   - criterion-3-baseline-map.png, criterion-3-search-map-before-clear.png and criterion-3-final.png show the same unobscured visible map extent, landmarks, orientation and 300 m scale before search, during search and after clearing.
4. **Passed:** The complete active-layer list remains the same as its recorded initial state while searching and after the query is cleared.
   - criterion-4-baseline-layers.png, criterion-4-search-layers-before-clear.png and criterion-4-final.png show the complete one-entry ALL Coverage Gap Candidate Areas list with identical controls throughout search and clearing; no list scrolling is needed.

**Review summary:** Criterion-owned screenshots directly support all four criteria. Results record https://o2intelligence-v4-dev.metricell.com/gis. The pre-existing coverage gap candidate areas loading warning remains visible and does not obstruct the assessed search, map or active-layer evidence.
