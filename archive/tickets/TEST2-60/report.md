# TEST2-60 Evidence Review

- **Ticket:** TEST2-60 — Keep a changed Show linked sites state when closing and reopening GIS Display Settings
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With one test-created Surveyor layer loaded in GIS using its defaults, open Display Settings for that same layer and capture the layer identity and the initial Show linked sites checkbox state.
   - Independent setup captures show Service / Last 30 days and the addition of a selected second Surveyor - Service row; criterion-1-final.png shows its initial Show linked sites checkbox checked.
2. **Passed:** With the same Surveyor layer remaining loaded and no additional layer added, change Show linked sites once and verify the checkbox visibly changes to the opposite state.
   - The criterion-owned before-change and after-change captures show checked then unchecked for the selected second Surveyor - Service row, with both existing map-layer rows retained.
3. **Passed:** With the same layer still loaded after the change, close and reopen Display Settings and verify Show linked sites remains in the changed state rather than returning to the recorded original state.
   - The recovered criterion-owned sequence shows checked, unchecked, Display Settings closed with both rows retained, then reopened unchecked for the same selected second row. Setup locator errors preceded the recovered sequence and do not establish an application defect.
4. **Passed:** With the same layer still loaded, change Show linked sites back to the recorded original state, close and reopen Display Settings, and verify the checkbox shows the original state.
   - The criterion-owned sequence records checked, changes to unchecked, closes/reopens unchecked, restores checked, then closes/reopens checked with the same selected second Surveyor - Service row and both rows retained.

**Review summary:** Reviewed all four criterion-owned screenshot sequences from attempt-001; the recorded browser URL is the required development host at /gis.
