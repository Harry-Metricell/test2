# TEST2-59 Evidence Review

- **Ticket:** TEST2-59 — Filter and clear the GIS layer catalogue while preserving a loaded Surveyor layer
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With the GIS layer catalogue unfiltered and a test-created Surveyor layer loaded with its default configuration, Surveyor and the recorded visible non-Surveyor catalogue entry are both visible, and the loaded Surveyor layer is identifiable in Map layers or the legend.
   - criterion-1-after-open-surveyor-before-add.png records the untouched pre-add configuration (Service, Last 30 days, All teams, all listed technologies, No network filter). criterion-1-after-open-gis.png shows the original single layer; criterion-1-final.png shows empty Search layers, Beacons, Surveyor (2), and the added second Surveyor - Service row with its legend.
2. **Passed:** After entering `Surveyor` in the visible Search layers field, at least one matching Surveyor catalogue entry remains visible and the recorded non-Surveyor entry is absent from the filtered catalogue, while the previously loaded Surveyor layer remains identifiable in Map layers or the legend without a duplicate.
   - criterion-2-loaded-before-search.png records Beacons and the complete two-row Map layers list. criterion-2-after-search.png shows Surveyor in Search layers, only Surveyor (2) in the catalogue, and the same two Map layers rows. The recovered sequence provides direct evidence despite the earlier locator errors.
3. **Passed:** After clearing the Search layers field, the recorded non-Surveyor catalogue entry is visible again, and the current Map layers entries match the recorded pre-search list with no duplicate or removed layer.
   - criterion-3-loaded-before-search.png, criterion-3-filtered-before-clear.png and criterion-3-after-clear.png show this criterion's unfiltered, filtered and cleared states. Beacons returns after clearing, and the complete two-row Surveyor - Service list retains its order and count.
4. **Passed:** After filtering and clearing the catalogue, Display Settings for the same loaded Surveyor layer remains accessible and its Show linked sites state matches the state recorded before the search journey.
   - criterion-4-display-settings-before-search.png and criterion-4-after-reopen-settings.png show Show linked sites checked before and after this criterion's filter-and-clear journey, with the same two loaded rows. criterion-4-settings-closed-before-filter.png still shows fading settings controls; criterion-4-filtered-before-clear.png proves they subsequently closed, and criterion-4-cleared-before-reopen-settings.png proves the cleared state before reopening.

**Review summary:** Reviewed the criterion-owned screenshot sequences for attempt-001.
