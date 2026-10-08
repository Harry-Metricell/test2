# TEST2-63 Evidence Review

- **Ticket:** TEST2-63 — Filter the V4 GIS layer catalogue for Surveyor and restore the original view
- **QA status:** Evidence Reviewed
- **Overall outcome:** Unverified
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With GIS open, Search layers empty, and the permitted setup complete, the catalogue visibly contains Surveyor and the tester has recorded the complete loaded Map layers entries and their order as the pre-search baseline.
   - criterion-1-after-confirm.png and criterion-1-final.png show GIS with empty Search layers, Surveyor (1) in the catalogue, and the complete Map layers list containing only Surveyor - Service, matching the recorded pre-search baseline.
2. **Passed:** After entering `Surveyor` in Search layers, the search text remains visible, Surveyor is visible in the filtered catalogue, and the loaded Map layers entries and order are unchanged from the recorded pre-search baseline.
   - criterion-2-after-confirm-before-search.png establishes the sole Surveyor - Service layer; criterion-2-after-search.png and criterion-2-final.png show retained Surveyor search text, the filtered Surveyor (1) entry, and the same sole loaded layer.
3. **Unverified:** After clearing Search layers, the original catalogue entries are visible again and the loaded Map layers entries and order match the recorded pre-search baseline.
   - criterion-3's before-search, filtered, and cleared screenshots show empty search restored and the sole Surveyor - Service layer unchanged. Visible catalogue entries return, but the 46-entry restoration claimed in results/report is not fully evidenced: middle Network entries and lower Planning/Custom Datasets entries are outside the captured scroll view before and after clearing.
4. **Passed:** After the search-and-clear journey, the user remains in GIS, the map is visible, and no application-error page or sign-in screen has interrupted the journey.
   - criterion-4's ordered setup, search, clear, and final screenshots retain GIS and a visible map without an error or sign-in screen. The recorded browserUrl is https://o2intelligence-v4-dev.metricell.com/gis.

**Review summary:** Completed attempt-001 evidence assessment; full catalogue restoration remains inconclusive because the complete before/after catalogue was not captured.
